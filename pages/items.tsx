import {
  Accordion,
  ActionIcon,
  Button,
  createStyles,
  CSSObject,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import {
  useDebouncedRepoSave,
  useRepositories,
  waitForTransactions,
} from "~/services";
import React, { useCallback, useMemo, useState } from "react";
import { ItemDefinition, ItemLog } from "~/orm/entities";
import { Repository } from "typeorm";
import { useListState } from "@mantine/hooks";
import { useAsyncEffect } from "use-async-effect";
import { EditModeToggle } from "~/components";

import {
  DataTable,
  DataTableProps,
  PropConfigEntry,
} from "~/components/dataTable/dataTable";
import { openContextModal, openModal } from "@mantine/modals";
import { AddIcon, EditIcon, ViewIcon } from "~/appIcons";
import { InventoryLine } from "~/pageComponents/items/InventoryLine";
import {
  InventoryCurrent,
  InventoryCurrentProps,
} from "~/pageComponents/items/InventoryCurrent";
import { InventoryEditItemDefModalContext } from "~/pageComponents/items/InventoryEditItemDefModal";
import {
  LogDataTable,
  LogDataTableProps,
} from "~/components/dataTable/logDataTable";
import { InventoryCategoryLabel } from "~/pageComponents/items/InventoryCategoryLabel";
import { AvatarIconImage } from "~/components/AvatarIconImage";
import { ModalName } from "~/modalsList";
import { EditInventoryModalContext } from "~/pageComponents/items/EditInventoryModal";
import { InventoryBBCodeOutput } from "~/pageComponents/items/InventoryBBCodeOutput";
import {
  createDayjsPropConfig,
  createImagePropConfig,
  createNumberPropConfig,
  createStringPropConfig,
  createTextAreaPropConfig,
} from "~/components/dataTable/configCreators";
import {
  CategoryIconPatterns,
  useItemCategoryMap,
} from "~/categoryIconPatterns";
import { css } from "@emotion/react";

const useDataTableStyles = createStyles({
  quantityChange: {
    width: "7em",
  },
  itemDefinitionId: {
    minWidth: "10em",
    maxWidth: "15em",
  },
  sourceUrl: {
    maxWidth: "12em",
  },
  name: {
    minWidth: "8em",
    maxWidth: "12em",
  },
  category: {
    minWidth: "8em",
    maxWidth: "10em",
  },
  imageLink: {
    minWidth: "5em",
    maxWidth: "8em",
  },
  description: {
    minWidth: "min(50vw, 20em)",
  },
} as Record<keyof (ItemDefinition & ItemLog), CSSObject>);

const ItemsPage: NextPage = () => {
  const [logRepo, defRepo] = useRepositories(ItemLog, ItemDefinition) as [
    Repository<ItemLog> | undefined,
    Repository<ItemDefinition> | undefined
  ];
  const [itemLogs, itemLogsHandler] = useListState<ItemLog>();
  const [itemDefs, itemDefsHandler] = useListState<ItemDefinition>();
  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!logRepo) return;
    await waitForTransactions(logRepo);
    itemLogsHandler.setState(await logRepo.find());
  }, [logRepo]);

  useAsyncEffect(async () => {
    if (!defRepo) return;
    await waitForTransactions(defRepo);
    itemDefsHandler.setState(await defRepo.find());
  }, [defRepo]);

  const [categories, categoryIcons] = useItemCategoryMap(itemDefs);

  const itemDefsIndex: Record<ItemDefinition["id"], ItemDefinition> | null =
    useMemo(() => {
      if (!itemDefs) return null;
      const result: typeof itemDefsIndex = {};
      for (const def of itemDefs) {
        result[def.id] = def;
      }
      return result;
    }, [itemDefs]);

  const currentInventoryData: InventoryCurrentProps["data"] | null =
    useMemo(() => {
      if (!itemLogs || itemLogs.length === 0 || !itemDefsIndex) return null;
      const result: typeof currentInventoryData = {};

      for (const log of itemLogs.filter((l) => !!l.itemDefinitionId)) {
        if (!log.itemDefinitionId) continue;

        const def = itemDefsIndex[log.itemDefinitionId];
        if (!def) continue;
        let lines = result[def.category || "Uncategorized"];
        if (!lines) {
          lines = result[def.category || "Uncategorized"] = {};
        }

        let lineData = lines[def.name];
        if (!lineData) {
          lines[def.name] = {
            itemDefId: def.id,
            quantity: log.quantityChange,
            name: def.name,
            quantityChanges: [
              {
                change: log.quantityChange,
                link: log.sourceUrl,
                tooltipLabel: [
                  log.sourceNote,
                  `(${log.date.format("DD-MMM-YYYY")})`,
                ].join(" "),
              },
            ],
            imageLink: def.imageLink,
            description: def.description,
          };
        } else {
          lineData.quantity! += log.quantityChange;
          lineData.quantityChanges!.push({
            change: log.quantityChange,
            link: log.sourceUrl,
            tooltipLabel: [
              log.sourceNote,
              `(${log.date.format("DD-MMM-YYYY")})`,
            ].join(" "),
          });
        }
      }

      const depletedCategory: typeof result[string] = (result["Depleted"] = {});
      for (const category of Object.values(result)) {
        for (const [key, line] of Object.entries(category)) {
          if (line.quantity === 0) {
            delete category[key];
            depletedCategory[key] = line;
          }
        }
      }

      return result;
    }, [itemLogs, itemDefsIndex]);

  const openViewItemDefModal = useCallback(
    (def: ItemDefinition | null) =>
      openModal({
        centered: true,
        size: "lg",
        title: def?.category ? (
          <InventoryCategoryLabel
            category={def.category}
            categoryIcons={categoryIcons}
          />
        ) : (
          <Text>Uncategorized</Text>
        ),
        children: (
          <InventoryLine
            data={{
              itemDefId: 0,
              name: def?.name ?? "Undefined Item",
              description: def?.description ?? "",
              imageLink: def?.imageLink ?? null,
            }}
          />
        ),
      }),
    [categoryIcons]
  );

  const openEditItemDefModal = useCallback(
    (
      def: ItemDefinition | undefined,
      onSaveCallback: (itemDef?: ItemDefinition) => Promise<void>
    ) =>
      openContextModal({
        modal: ModalName.ItemDefEditor,
        title: "Select Item Definition",
        centered: true,
        innerProps: {
          existingItemDef: def,
          availableItemDefs: itemDefs,
          categoryIcons,
          onSaveCallback,
        } as InventoryEditItemDefModalContext,
      }),
    [categoryIcons, itemDefs]
  );

  const itemDefConfig: PropConfigEntry<ItemLog, "itemDefinitionId"> = useMemo(
    () => ({
      headerLabel: "Item",
      order: 2,
      viewComponent: (value) => {
        const def = value ? itemDefsIndex?.[value] ?? null : null;
        return (
          <Group noWrap position="left" spacing={0}>
            {def && def.imageLink && (
              <AvatarIconImage imageLink={def.imageLink} />
            )}
            <Text>{def?.name}</Text>
            <ActionIcon ml="auto" onClick={() => openViewItemDefModal(def)}>
              <ViewIcon />
            </ActionIcon>
          </Group>
        );
      },
      editorComponent: (value, onChange) => {
        const def = value ? itemDefsIndex?.[value] : undefined;
        return (
          <Group noWrap position="apart">
            <Text>{def?.name}</Text>
            <ActionIcon
              onClick={() =>
                openEditItemDefModal(
                  def,
                  async (itemDef: ItemDefinition | undefined) =>
                    await onChange(itemDef?.id ?? null)
                )
              }
            >
              <EditIcon />
            </ActionIcon>
          </Group>
        );
      },
    }),
    [openViewItemDefModal, openEditItemDefModal, itemDefsIndex]
  );

  const dataTableStyles = useDataTableStyles();
  const saveItemLog = useDebouncedRepoSave(logRepo ?? null);
  const saveItemDef = useDebouncedRepoSave(defRepo ?? null);

  const editInventoryModalSaveCallback = useCallback(
    async (itemDef: ItemDefinition, itemLogs: ItemLog[]) => {
      if (!logRepo || !defRepo) return;

      itemDef.itemLogs = itemLogs.map((l) => ({
        id: l.id > 0 ? l.id : undefined,
        itemDefinition: itemDef,
        itemDefinitionId: itemDef.id,
        quantityChange: l.quantityChange,
        sourceNote: l.sourceNote,
        sourceUrl: l.sourceUrl,
        date: l.date,
      })) as ItemLog[];

      await defRepo.save(itemDef);

      itemDefsHandler.setState(await defRepo.find());
      itemLogsHandler.setState(await logRepo.find());
    },
    [logRepo, defRepo, itemDefsHandler, itemLogsHandler]
  );

  const openEditInventoryModal = useCallback(
    (itemDefId: number | null) => {
      const itemDef = (itemDefId && itemDefsIndex?.[itemDefId]) || null;
      openContextModal({
        modal: ModalName.EditInventory,
        title: <Title>{itemDef ? "Edit Item" : "Create Item"}</Title>,
        size: "xl",
        innerProps: {
          startingItemDef: itemDef,
          itemDefNames: itemDefs.map((d) => d.name),
          itemLogs: itemLogs,
          categories: categories.filter(
            (c) => c !== "Depleted" && c !== "Uncategorized"
          ),
          categoryIconsPatterns: CategoryIconPatterns,
          categoryIcons,
          dataTableClasses: dataTableStyles.classes,
          onSaveCallback: editInventoryModalSaveCallback,
        } as EditInventoryModalContext,
      });
    },
    [
      categories,
      categoryIcons,
      dataTableStyles.classes,
      editInventoryModalSaveCallback,
      itemDefs,
      itemDefsIndex,
      itemLogs,
    ]
  );

  const deleteItemDefinition = useCallback(
    async (itemDefId: number) => {
      if (!logRepo || !defRepo) return;
      itemLogsHandler.filter((l) => l.itemDefinitionId !== itemDefId);
      itemDefsHandler.filter((l) => l.id !== itemDefId);
      await waitForTransactions(logRepo);
      await logRepo.delete({ itemDefinitionId: itemDefId });
      await waitForTransactions(defRepo);
      await defRepo.delete({ id: itemDefId });
    },
    [logRepo, defRepo, itemLogsHandler, itemDefsHandler]
  );

  const currentInventoryComp = useMemo(
    () =>
      categories === null || currentInventoryData == null ? (
        <Text>Add items to get started</Text>
      ) : (
        <InventoryCurrent
          key={`items-inventory-current`}
          categories={categories}
          categoryIcons={categoryIcons}
          data={currentInventoryData}
          isEditMode={editModeOn}
          onEditClick={openEditInventoryModal}
          onConfirmedDelete={deleteItemDefinition}
        />
      ),
    [
      categories,
      categoryIcons,
      currentInventoryData,
      editModeOn,
      openEditInventoryModal,
      deleteItemDefinition,
    ]
  );

  const itemLogDataTableProps: Pick<
    LogDataTableProps<ItemLog>,
    "isShopLog" | "rowObjToId" | "propConfig" | "add" | "edit" | "remove"
  > = useMemo(
    () => ({
      isShopLog: false,
      rowObjToId: (log) => log.id,
      propConfig: {
        quantityChange: createNumberPropConfig("quantityChange", "Change", 1),
        itemDefinitionId: itemDefConfig,
        date: createDayjsPropConfig("date", "Date", 200),
      },
      add: async () => {
        if (!logRepo) return;
        await waitForTransactions(logRepo);
        itemLogsHandler.append(await logRepo.save(logRepo.create()));
      },
      edit: async (log, prop, value) => {
        const index = itemLogs.findIndex((l) => l.id === log.id);
        itemLogsHandler.setItemProp(index, prop, value);
        saveItemLog(log, { [prop]: value });
      },
      remove: async (log) => {
        if (!logRepo) return;
        itemLogsHandler.filter((l) => l.id !== log.id);
        await waitForTransactions(logRepo);
        await logRepo?.remove(log);
      },
    }),
    [itemDefConfig, itemLogs, itemLogsHandler, logRepo, saveItemLog]
  );

  const defDataTableProps: Pick<
    DataTableProps<ItemDefinition>,
    "rowObjToId" | "propConfig" | "add" | "edit" | "remove"
  > = useMemo(
    () => ({
      rowObjToId: (def) => def.id,
      propConfig: {
        name: createTextAreaPropConfig("name", "Name", 0),
        category: createStringPropConfig("category", "Category", 1),
        imageLink: createImagePropConfig("imageLink", "Image", 2),
        description: createTextAreaPropConfig("description", "Description", 3),
      },
      add: async () => {
        if (!defRepo) return;
        await waitForTransactions(defRepo);
        itemDefsHandler.append(await defRepo.save(defRepo.create()));
      },
      edit: async (def, prop, value) => {
        const index = itemDefs.findIndex((d) => d.id === def.id);
        itemDefsHandler.setItemProp(index, prop, value);
        saveItemDef(def, { [prop]: value });
      },
      remove: async (def) => {
        if (!defRepo || !logRepo) return;
        itemDefsHandler.filter((d) => d.id !== def.id);
        const orphanedLogs = itemLogs.filter(
          (l) => l.itemDefinitionId === def.id
        );
        itemLogsHandler.filter((l) => !orphanedLogs.some((o) => o.id === l.id));

        await waitForTransactions(defRepo);
        await defRepo.remove(def);

        await waitForTransactions(logRepo);
        await logRepo.remove(orphanedLogs);
      },
    }),
    [
      defRepo,
      itemDefs,
      itemDefsHandler,
      itemLogs,
      itemLogsHandler,
      logRepo,
      saveItemDef,
    ]
  );

  if (!logRepo || !defRepo) {
    return <Title>LOADING...</Title>;
  }

  return (
    <>
      <Stack>
        <Group
          pos="relative"
          position="center"
          sx={{
            alignContent: "center",
          }}
        >
          <Title order={2} align="center">
            Items
          </Title>
          <div
            css={css`
              position: absolute;
              right: 0;
            `}
          >
            <EditModeToggle checked={editModeOn} onToggle={setEditModeOn} />
          </div>
        </Group>
        <Group position="apart">
          <Title order={3}>Inventory Summary</Title>
          {editModeOn && (
            <Button
              color="green"
              leftIcon={<AddIcon />}
              onClick={() => openEditInventoryModal(null)}
            >
              Add New Item
            </Button>
          )}
        </Group>
        {currentInventoryComp}
        <Title order={3}>Inventory Log Details</Title>
        <Accordion
          variant="separated"
          multiple={true}
          sx={(theme) => ({
            ".mantine-Accordion-panel": {
              margin: "0.5em",
              borderRadius: "0.5em",
              border: "1px solid " + theme.colors.gray[7],
              backgroundColor: theme.fn.darken(theme.colors.gray[9], 0.2),
            },
            ".mantine-Accordion-content": {
              borderRadius: "0.5em",
              overflow: "clip",
              padding: "2px",
            },
          })}
        >
          <Accordion.Item value={"item-defs"}>
            <Accordion.Control>
              <Title order={4}>Item Definitions</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <ScrollArea.Autosize maxHeight="50vh">
                <DataTable
                  key={`items-log-editor`}
                  {...defDataTableProps}
                  rowObjs={itemDefs}
                  isEditMode={editModeOn}
                  propsToMantineClasses={dataTableStyles.classes}
                />
              </ScrollArea.Autosize>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value={"item-log"}>
            <Accordion.Control>
              <Title order={4}>Item Log</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <ScrollArea.Autosize maxHeight="50vh">
                <LogDataTable
                  key={`items-log-editor`}
                  {...itemLogDataTableProps}
                  rowObjs={itemLogs}
                  isEditMode={editModeOn}
                  propsToMantineClasses={dataTableStyles.classes}
                />
              </ScrollArea.Autosize>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Title order={3}>Output Preview</Title>
        {currentInventoryData && (
          <InventoryBBCodeOutput
            key="inv-bbcode-output"
            data={currentInventoryData}
          />
        )}
      </Stack>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default ItemsPage;
