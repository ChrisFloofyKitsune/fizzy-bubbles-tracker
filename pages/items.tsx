import {
  ActionIcon,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { useRepositories, waitForTransactions } from "~/services";
import { useMemo, useState } from "react";
import { ItemDefinition, ItemLog } from "~/orm/entities";
import { Repository } from "typeorm";
import { useListState } from "@mantine/hooks";
import { useAsyncEffect } from "use-async-effect";
import { EditModeToggle } from "~/components";
import { filterUnique } from "~/util";
import {
  TbApple,
  TbBallon,
  TbCandy,
  TbCircleDotted,
  TbDiamond,
  TbDisc,
  TbKey,
  TbMedicineSyrup,
  TbPaw,
  TbPokeball,
  TbSoup,
  TbSwords,
  TbTriangleSquareCircle,
} from "react-icons/tb";
import { IconType } from "react-icons";
import {
  LogEditor,
  PropToEditorComponentPair,
} from "~/components/input/logEditor";
import { DatePropToEditor } from "~/components/input/logEditorDate";
import { numberPropToEditor } from "~/components/input/logEditorNumber";
import { openModal } from "@mantine/modals";
import { EditIcon, ViewIcon } from "~/appIcons";
import { InventoryLine } from "~/pageComponents/InventoryLine";
import {
  InventoryCurrent,
  InventoryCurrentProps,
} from "~/pageComponents/InventoryCurrent";

const CategoryIconPatterns = {
  "^depleted$": TbCircleDotted,
  "key|unique": TbKey,
  ball: TbPokeball,
  medic: TbMedicineSyrup,
  held: TbBallon,
  "battle|combat": TbSwords,
  "doll|plush": TbPaw,
  ingredient: TbSoup,
  berr: TbApple,
  "treasure|valuable": TbDiamond,
  "tm|tr|hm|move": TbDisc,
  item: TbCandy,
  ".": TbTriangleSquareCircle,
};

const Items: NextPage = () => {
  const [repo, defRepo] = useRepositories(ItemLog, ItemDefinition) as [
    Repository<ItemLog> | undefined,
    Repository<ItemDefinition> | undefined
  ];
  const [itemLogs, itemLogsHandler] = useListState<ItemLog>();
  const [itemDefs, itemDefsHandler] = useListState<ItemDefinition>();
  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitForTransactions(repo);
    itemLogsHandler.setState(await repo.find());
  }, [repo]);

  useAsyncEffect(async () => {
    if (!defRepo) return;
    await waitForTransactions(defRepo);
    itemDefsHandler.setState(await defRepo.find());
  }, [defRepo]);

  const categories = useMemo(() => {
    if (itemDefs.length === 0) return null;
    return itemDefs
      .map((d) => d.category)
      .filter(filterUnique)
      .concat("Depleted");
  }, [itemDefs]);

  const categoryIcons: Record<string, IconType> = useMemo(() => {
    if (!categories) return {};

    const results = categories.map((c) => ({
      [c]: Object.entries(CategoryIconPatterns).find(
        (entry) => !!c.match(new RegExp(entry[0], "i"))
      )?.[1],
    }));

    return Object.assign({}, ...results);
  }, [categories]);

  const itemDefsIndex: Record<ItemDefinition["name"], ItemDefinition> | null =
    useMemo(() => {
      if (!itemDefs) return null;
      const result: typeof itemDefsIndex = {};
      for (const def of itemDefs) {
        result[def.name] = def;
      }
      return result;
    }, [itemDefs]);

  const currentInventoryData: InventoryCurrentProps["data"] | null = useMemo(() => {
    if (!itemLogs || !itemDefsIndex) return null;
    const result: typeof currentInventoryData = {};
    for (const log of itemLogs.filter((l) => !!l.itemDefinitionId)) {
      if (!log.itemDefinitionId) continue;

      const def = itemDefsIndex[log.itemDefinitionId];
      let lines = result[def.category];
      if (!lines) {
        lines = result[def.category] = {};
      }

      let lineData = lines[def.name];
      if (!lineData) {
        lines[def.name] = {
          quantity: log.quantityChange,
          name: def.name,
          quantityChanges: [
            { change: log.quantityChange, link: log.sourceUrl },
          ],
          imageLink: def.imageLink,
          description: def.description,
        };
      } else {
        lineData.quantity! += log.quantityChange;
        lineData.quantityChanges!.push({
          change: log.quantityChange,
          link: log.sourceUrl,
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

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editModalContext, setEditModalContext] = useState<{
    itemLog: ItemLog;
    onChange: (value: string | null) => Promise<void>;
  }>();
  const openSelectItemDefModal = useMemo(() => {
    return (
      itemLog: ItemLog,
      isEditMode: boolean,
      onChange: (value: string | null) => Promise<void>
    ) => {
      if (!itemDefsIndex) return;
      let def: ItemDefinition | null;
      if (!!itemLog.itemDefinitionId) {
        def = itemDefsIndex[itemLog.itemDefinitionId];
      } else {
        def = null;
      }

      if (!isEditMode) {
        openModal({
          centered: true,
          size: "lg",
          title: def ? (
            <Group>
              {categoryIcons[def.category]?.({ size: 30 }) ?? ""}
              <Text>{def.category}</Text>
            </Group>
          ) : (
            <Text>Uncategorized</Text>
          ),
          children: (
            <InventoryLine
              data={{
                name: def?.name ?? "Undefined Item",
                description: def?.description ?? "",
                imageLink: def?.imageLink ?? null,
              }}
            />
          ),
        });
      } else {
        setEditModalOpen(true);
        setEditModalContext({ itemLog, onChange });
      }
    };
  }, [categoryIcons, itemDefsIndex]);

  const ItemDefIdToEditor: PropToEditorComponentPair<
    ItemLog,
    "itemDefinitionId"
  > = {
    prop: "itemDefinitionId",
    toComponent: (log, isEditMode, onChange) => (
      <Group noWrap sx={{ width: "10em" }}>
        <Text>{log.itemDefinitionId}</Text>
        <ActionIcon
          ml="auto"
          onClick={() => openSelectItemDefModal(log, isEditMode, onChange)}
        >
          {isEditMode ? <EditIcon /> : <ViewIcon />}
        </ActionIcon>
      </Group>
    ),
  };
  if (!repo || !defRepo) {
    return <Title>LOADING...</Title>;
  }

  return (
    <>
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        size="lg"
      >
        <Group spacing="0.5em" position="right">
          <Tabs sx={{ flexGrow: 1 }}>
            <Tabs.List grow>
              <Tabs.Tab value="select">SELECT</Tabs.Tab>
              <Tabs.Tab value="edit">EDIT</Tabs.Tab>
              <Tabs.Tab value="new">NEW</Tabs.Tab>
            </Tabs.List>
            <Button
              onClick={() => editModalContext?.onChange("AAAAAA")}
            ></Button>
          </Tabs>
        </Group>
      </Modal>
      <Stack>
        <Group
          sx={{
            alignContent: "center",
          }}
        >
          <Title
            order={2}
            sx={{
              width: "50%",
              textAlign: "right",
              marginRight: "auto",
            }}
          >
            Items
          </Title>
          <EditModeToggle checked={editModeOn} onToggle={setEditModeOn} />
        </Group>
        <Title order={3}>Current Inventory</Title>
        {categories === null || currentInventoryData == null ? (
          <Text>Add items to get started</Text>
        ) : (
          <InventoryCurrent
            categories={categories}
            categoryIcons={categoryIcons}
            data={currentInventoryData}
          />
        )}
        <Title order={3}>Item Log</Title>
        <ScrollArea.Autosize maxHeight="50vh">
          <LogEditor
            logs={itemLogs}
            isShopLog={false}
            isEditMode={editModeOn}
            propsToLabelsPairs={[
              { prop: "quantityChange", label: "Change" },
              { prop: "itemDefinitionId", label: "Item" },
              { prop: "date", label: "Date", order: 200 },
            ]}
            propsToEditorComponentPairs={[
              numberPropToEditor<ItemLog, "quantityChange">("quantityChange"),
              ItemDefIdToEditor,
              DatePropToEditor<ItemLog>(),
            ]}
            edit={async (log, prop, value) => console.log(log, prop, value)}
          />
        </ScrollArea.Autosize>
        <Title order={3}>Output Preview</Title>
      </Stack>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default Items;
