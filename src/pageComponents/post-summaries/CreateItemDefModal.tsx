import { ItemDefinition } from "~/orm/entities";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useCallback, useState } from "react";
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { ModalName } from "~/modalsList";
import { CancelIcon, SaveIcon } from "~/appIcons";
import { useRepository } from "~/services";
import { useAsyncEffect } from "use-async-effect";
import { getIconForCategory } from "~/categoryIconPatterns";
import { AvatarIconImage } from "~/components";
import { useForm } from "@mantine/form";
import {
  SimpleSelectItem,
  SimpleSelectItemView,
} from "~/components/SimpleSelectItemView";

export type CreateItemDefModalProps = {
  onSubmit: (itemDef: ItemDefinition) => Promise<void>;
};

export function CreateItemDefModal(
  props: ContextModalProps<CreateItemDefModalProps>
) {
  const { onSubmit } = props.innerProps;
  const repo = useRepository(ItemDefinition);

  const createCategorySelectItem = useCallback(
    (category: string): SimpleSelectItem => ({
      value: category,
      label: category,
      component: (
        <Group spacing="xs">
          {getIconForCategory(category)?.({ size: "2em" }) ?? null}
          <Text>{category}</Text>
        </Group>
      ),
    }),
    []
  );

  const [categories, setCategories] = useState<SimpleSelectItem[]>([]);
  useAsyncEffect(async () => {
    if (!repo) return;
    setCategories(
      (await repo.query(`SELECT DISTINCT category FROM item_definition`)).map(
        (r: Pick<ItemDefinition, "category">) =>
          createCategorySelectItem(r.category ?? "uncategorized")
      )
    );
  }, [repo]);

  const itemDefForm = useForm<Omit<ItemDefinition, "id" | "itemLogs">>({
    initialValues: {
      category: "",
      name: "",
      imageLink: "",
      description: "",
    },
  });

  if (!repo) {
    return <></>;
  }

  return (
    <form
      onSubmit={itemDefForm.onSubmit((values) => {
        const newDef = Object.assign(new ItemDefinition(), values);
        repo?.save(newDef).then(async () => {
          await onSubmit(newDef);
          props.context.closeModal(props.id);
        });
      })}
    >
      <Stack>
        <Select
          label="Item Category"
          placeholder={"Select or Type to create new Category"}
          inputWrapperOrder={["label", "input", "description", "error"]}
          icon={getIconForCategory(
            itemDefForm.values.category || "uncategorized"
          )?.({
            size: "2em",
          })}
          searchable
          creatable
          getCreateLabel={(query) => (
            <Group noWrap spacing={0}>
              Create Category &quot;
              {getIconForCategory(query)?.({
                size: "1em",
                style: {
                  marginLeft: "0.25em",
                  marginRight: "1em",
                  transform: "scale(200%)",
                  display: "inline-block",
                },
              }) ?? null}
              <Text size="md">{query}</Text>
              &quot;
            </Group>
          )}
          onCreate={(query) => {
            const newItem = createCategorySelectItem(query);
            setCategories((prev) => prev.concat(newItem));
            return newItem;
          }}
          data={categories}
          itemComponent={SimpleSelectItemView}
          {...itemDefForm.getInputProps("category")}
        />
        <TextInput label="Item Name" {...itemDefForm.getInputProps("name")} />
        <TextInput
          icon={<AvatarIconImage />}
          label="Item Icon"
          {...itemDefForm.getInputProps("imageLink")}
        ></TextInput>
        <Textarea
          label="Item Description"
          autosize
          {...itemDefForm.getInputProps("description")}
          minRows={8}
          maxRows={8}
        ></Textarea>
        <Group>
          <Button leftIcon={<SaveIcon />} type={"submit"}>
            Save
          </Button>
          <Button
            leftIcon={<CancelIcon />}
            onClick={() => props.context.closeModal(props.id, true)}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function OpenCreateItemDefModal(innerProps: CreateItemDefModalProps) {
  openContextModal({
    modal: ModalName.CreateItemDef,
    title: <Title order={2}>Create new Item Definition</Title>,
    size: "lg",
    innerProps,
    centered: true,
  });
}
