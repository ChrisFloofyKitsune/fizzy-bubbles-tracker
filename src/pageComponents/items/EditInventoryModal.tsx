import { ItemDefinition, ItemLog } from "~/orm/entities";
import { IconType } from "react-icons";
import { ContextModalProps } from "@mantine/modals";
import {
  Button,
  Divider,
  Group,
  ScrollArea,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { CancelIcon, SaveIcon } from "~/appIcons";
import { useListState } from "@mantine/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import {
  ItemCategorySelectItem,
  ItemCategorySelectItemProps,
} from "~/pageComponents/items/InventorySelectItems";
import { filterUnique } from "~/util";
import { ItemDefinitionImage } from "~/pageComponents/items/ItemDefinitionImage";
import {
  LogDataTable,
  LogDataTableProps,
} from "~/components/dataTable/logDataTable";
import { createNumberPropConfig } from "~/components/dataTable/configCreators/createNumberPropConfig";
import { createDayjsPropConfig } from "~/components/dataTable/configCreators/createDayjsPropConfig";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { OpenContextModal } from "@mantine/modals/lib/context";
dayjs.extend(utc);

export type EditInventoryModalContext = {
  startingItemDef?: ItemDefinition;
  allItemDefNames: string[];
  allItemLogs: ItemLog[];
  allCategories: string[];
  categoryIcons: Record<string, IconType>;
  categoryIconsPatterns: Record<string, IconType>;
  dataTableClasses: Record<string, string>;
  onSaveCallback: (
    itemDefinition: ItemDefinition,
    itemLogs: ItemLog[]
  ) => Promise<void>;
  startingPage?: number;
};
export function EditInventoryModal({
  context,
  id: modalId,
  innerProps: {
    startingItemDef,
    allItemDefNames,
    allItemLogs,
    allCategories,
    categoryIcons,
    categoryIconsPatterns,
    dataTableClasses,
    onSaveCallback,
    startingPage,
  },
}: ContextModalProps<EditInventoryModalContext>) {
  const validItemNames = useMemo(
    () =>
      allItemDefNames.filter(
        (n) => !!startingItemDef && n !== startingItemDef.name
      ),
    [allItemDefNames, startingItemDef]
  );

  const [validCategories, validCategoriesHandler] = useListState(
    allCategories.filter((c) => !!c).filter(filterUnique)
  );

  const [validCategoryIcons, setValidCategoryIcons] =
    useState<typeof categoryIcons>(categoryIcons);

  const form = useForm({
    initialValues: {
      id: startingItemDef?.id ?? null,
      name: startingItemDef?.name ?? "",
      category: startingItemDef?.category ?? "",
      imageLink: startingItemDef?.imageLink ?? "",
      description: startingItemDef?.description ?? "",
    } as Omit<ItemDefinition, "id"> & { id: number | null },
    validate: {
      name: (value: string) =>
        validItemNames.includes(value)
          ? "That item name is already in use"
          : null,
      category: (value: string) =>
        value.length === 0 ? "Must enter an item category" : null,
    },
    validateInputOnChange: ["name", "category"],
  });

  const [logs, logsHandler] = useListState<ItemLog>(
    startingItemDef
      ? allItemLogs.filter((l) => l.itemDefinitionId === startingItemDef.id)
      : []
  );

  const categorySelectItems: ItemCategorySelectItemProps[] = useMemo(
    () =>
      validCategories.map((c) => ({
        value: c,
        label: c,
        categoryIcons: validCategoryIcons,
      })),
    [validCategories, validCategoryIcons]
  );

  const onCategoryCreate = useCallback(
    (newCategory: string) => {
      validCategoriesHandler.append(newCategory);
      const newCategoryIcon = Object.entries(categoryIconsPatterns).find(
        (entry) => !!newCategory.match(new RegExp(entry[0], "i"))
      )?.[1];
      const updatedIconMap = Object.assign({}, validCategoryIcons, {
        [newCategory]: newCategoryIcon,
      });
      setValidCategoryIcons(updatedIconMap);
      return {
        value: newCategory,
        label: newCategory,
        categoryIcons: updatedIconMap,
      } as ItemCategorySelectItemProps;
    },
    [validCategoriesHandler, categoryIconsPatterns, validCategoryIcons]
  );

  const [imageLink, setImageLink] = useState<string | null>(
    startingItemDef?.imageLink ?? null
  );

  const [currentPage, setCurrentPage] = useState<number>(startingPage ?? 1);

  const myProps = useMemo(
    () => context.modals.find((m) => m.id === modalId)?.props,
    [context.modals, modalId]
  );

  const dataTableProps: Pick<
    LogDataTableProps<ItemLog>,
    | "isEditMode"
    | "isShopLog"
    | "rowObjToId"
    | "propConfig"
    | "add"
    | "edit"
    | "remove"
    | "rowsPerPage"
  > = useMemo(
    () => ({
      isEditMode: true,
      rowObjToId: (log) => log.id,
      isShopLog: false,
      propConfig: {
        quantityChange: createNumberPropConfig("quantityChange", "Change", 0),
        date: createDayjsPropConfig("date", "Date", 200),
      },
      add: async () => {
        const newLog = new ItemLog();
        newLog.itemDefinitionId = form.values["id"];
        newLog.id = -logs.length;
        newLog.date = dayjs().utc();
        logsHandler.append(newLog);
      },
      edit: async (log, prop, value) => {
        const index = logs.findIndex((l) => l.id === log.id);
        logsHandler.setItemProp(index, prop, value);
      },
      remove: async (log) => {
        console.log("TRYING TO DELETE");
        if (!myProps) return;
        const innerProps = (
          myProps as OpenContextModal<EditInventoryModalContext>
        ).innerProps;
        innerProps.allItemLogs = innerProps.allItemLogs.filter(
          (l) => l.id !== log.id
        );
      },
      rowsPerPage: 6,
    }),
    [form.values, logs, logsHandler, myProps]
  );

  useEffect(() => {
    return () => {
      // this modal has been closed and is off the stack
      if (!myProps) return;

      const innerProps = (
        myProps as OpenContextModal<EditInventoryModalContext>
      ).innerProps;
      innerProps.allCategories = validCategories;
      innerProps.allItemLogs = logs;
      innerProps.categoryIcons = validCategoryIcons;
      innerProps.startingItemDef = form.values as ItemDefinition;
      innerProps.startingPage = currentPage;
      console.log("saved", innerProps);
    };
  }, [
    currentPage,
    form.values,
    logs,
    myProps,
    validCategories,
    validCategoryIcons,
  ]);

  return (
    <Stack>
      <Stack spacing="0.5em">
        <Group
          position="apart"
          sx={{
            "&>*": {
              flexGrow: 1,
            },
          }}
        >
          <Select
            required
            label="Item Category"
            placeholder="Select or type"
            data={categorySelectItems}
            itemComponent={ItemCategorySelectItem}
            nothingFound="No matching categories"
            searchable
            creatable
            getCreateLabel={(query) => `+ Add Category "${query}"`}
            onCreate={onCategoryCreate}
            icon={validCategoryIcons[
              form.values["category"] || "Uncategorized"
            ]({
              size: 24,
            })}
            {...form.getInputProps("category")}
          />

          <TextInput
            required
            label="Item Name"
            placeholder="Name of the item"
            {...form.getInputProps("name")}
          />
        </Group>

        <TextInput
          label="Item Icon"
          icon={<ItemDefinitionImage imageLink={imageLink} />}
          styles={{
            icon: {
              marginLeft: "0.25em",
            },
          }}
          placeholder={"http(s)://path.to.image/img.ext"}
          {...form.getInputProps("imageLink")}
          onBlur={(event) => setImageLink(event.currentTarget.value)}
        />

        <Textarea
          autosize
          label="Item Description"
          placeholder="(what the item does)"
          styles={{
            input: {
              resize: "vertical",
            },
          }}
          {...form.getInputProps("description")}
        />
      </Stack>

      <Divider />

      <ScrollArea.Autosize
        maxHeight="50vh"
        sx={(theme) => ({
          borderRadius: "0.25em",
          overflow: "clip",
          border: "1px solid " + theme.colors.dark[4],
        })}
      >
        <LogDataTable
          {...dataTableProps}
          rowObjs={logs}
          propsToMantineClasses={dataTableClasses}
          startingPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </ScrollArea.Autosize>

      <Group position="right">
        <Button
          variant="outline"
          color="yellow"
          onClick={() => context.closeModal(modalId)}
          leftIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          color="green"
          onClick={async () => {
            await onSaveCallback(form.values as ItemDefinition, []);
            context.closeModal(modalId);
          }}
          leftIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}
