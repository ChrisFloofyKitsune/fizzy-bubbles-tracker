import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Box, TextInput } from "@mantine/core";
import { ItemDefinitionImage } from "~/pageComponents/items/ItemDefinitionImage";

export function createImagePropConfig<T extends {}, P extends keyof T>(
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P> {
  return {
    headerLabel,
    order,
    viewComponent: (value: any) => (
      <Box
        key={"image-prop-view"}
        sx={(theme) => ({
          height: "2em",
          width: "min-content",
          padding: "0 0.25em",
        })}
      >
        {value && <ItemDefinitionImage imageLink={value} />}
      </Box>
    ),
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => (
      <Box
        key={"image-prop-edit"}
        sx={(theme) => ({
          boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
          borderRadius: "0.25em",
          height: "2em",
          padding: "0 0.25em",
        })}
      >
        <TextInput
          key={"url-prop-input"}
          variant="unstyled"
          sx={{
            ".mantine-Input-input": {
              height: "2em",
            },
          }}
          value={value ?? ""}
          onChange={async (event) => await onChange(event.currentTarget.value)}
        />
      </Box>
    ),
  };
}
