import { ItemDefinition, ItemLog } from "~/orm/entities";
import { IconType } from "react-icons";
import { ContextModalProps } from "@mantine/modals";
import {
  Button,
  Divider,
  Group,
  ScrollArea,
  Select,
  SimpleGrid,
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
import { AvatarIconImage } from "~/components/AvatarIconImage";
import {
  LogDataTable,
  LogDataTableProps,
} from "~/components/dataTable/logDataTable";
import {
  createLocalDatePropConfig,
  createNumberPropConfig,
} from "~/components/dataTable/configCreators";
import { LocalDate, ZoneId } from "@js-joda/core";

export type EditInventoryModalContext = {
  startingItemDef?: ItemDefinition;
  itemDefNames: string[];
  itemLogs: ItemLog[];
  categories: string[];
  startingPage?: number;
  categoryIcons: Record<string, IconType>;
  categoryIconsPatterns: Record<string, IconType>;
  dataTableClasses: Record<string, string>;
  onSaveCallback: (
    itemDefinition: ItemDefinition,
    itemLogs: ItemLog[]
  ) => Promise<void>;
};

export function EditInventoryModal({
  context,
  id: modalId,
  innerProps: props,
}: ContextModalProps<EditInventoryModalContext>) {
  const {
    itemDefNames,
    categoryIconsPatterns,
    dataTableClasses,
    onSaveCallback,
  } = props;

  const validItemNames = useState(
    itemDefNames.filter(
      (n) => !props.startingItemDef || n !== props.startingItemDef.name
    )
  )[0];

  const [validCategories, validCategoriesHandler] = useListState(
    props.categories.filter((c) => !!c).filter(filterUnique)
  );

  const [validCategoryIcons, setValidCategoryIcons] = useState<
    typeof props.categoryIcons
  >(props.categoryIcons);

  const form = useForm({
    initialValues: {
      id: props.startingItemDef?.id ?? null,
      name: props.startingItemDef?.name ?? "",
      category: props.startingItemDef?.category ?? "",
      imageLink: props.startingItemDef?.imageLink ?? "",
      description: props.startingItemDef?.description ?? "",
    } as Omit<ItemDefinition, "id"> & { id: number | null },
    validate: {
      name: (value: string) => {
        if (value.trim().length === 0) return "Must enter an item name";

        if (validItemNames.includes(value))
          return "That item name is already in use";

        return null;
      },
      category: (value: string | null) =>
        !value || value.length === 0 ? "Must enter an item category" : null,
    },
    validateInputOnChange: ["name", "category"],
  });

  const makeNewItemLog = useCallback(
    (logsLength: number, startQuantity = 1) => {
      const newLog = new ItemLog();
      newLog.id = -(logsLength + 1);
      newLog.quantityChange = startQuantity;
      newLog.itemDefinitionId = form.values["id"];
      newLog.date = LocalDate.now(ZoneId.UTC);
      return newLog;
    },
    [form.values]
  );

  const [logs, logsHandler] = useListState<ItemLog>(
    props?.startingItemDef?.id
      ? props.itemLogs.filter(
          (l) => l.itemDefinitionId === props?.startingItemDef?.id
        )
      : [makeNewItemLog(0, 1)]
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
    props.startingItemDef?.imageLink ?? null
  );

  const [currentPage, setCurrentPage] = useState<number>(
    props.startingPage ?? 1
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
        date: createLocalDatePropConfig("date", "Date", 200),
      },
      add: async () => {
        logsHandler.append(makeNewItemLog(logs.length));
      },
      edit: async (log, prop, value) => {
        const index = logs.findIndex((l) => l.id === log.id);
        logsHandler.setItemProp(index, prop, value);
      },
      remove: async (log) => {
        if (!props) return;
        // this modal only exists as a "save file" when the
        // delete confirmation is open so... edit that save file
        props.itemLogs = props.itemLogs.filter((l) => l.id !== log.id);
      },
      rowsPerPage: 6,
    }),
    [logs, logsHandler, makeNewItemLog, props]
  );

  useEffect(() => {
    return () => {
      props.categories = validCategories;
      props.itemLogs = logs;
      props.categoryIcons = validCategoryIcons;
      props.startingItemDef = form.values as ItemDefinition;
      props.startingPage = currentPage;
    };
  }, [
    currentPage,
    form.values,
    logs,
    props,
    validCategories,
    validCategoryIcons,
  ]);

  return (
    <Stack>
      <Stack spacing="sm">
        <SimpleGrid cols={2}>
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
            ]?.({
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
        </SimpleGrid>

        <TextInput
          label="Item Icon"
          icon={<AvatarIconImage imageLink={imageLink} />}
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
          disabled={logs.length === 0}
          color="green"
          onClick={async () => {
            const validationResult = form.validate();
            if (validationResult.hasErrors) {
              return;
            }

            await onSaveCallback(form.values as ItemDefinition, logs);
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
