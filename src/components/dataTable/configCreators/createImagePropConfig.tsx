import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Box, TextInput } from "@mantine/core";
import { AvatarIconImage } from "~/components/AvatarIconImage";

export function createImagePropConfig<
  Object extends {},
  Property extends keyof Object
>(
  prop: Property,
  headerLabel: string,
  order?: number
): PropConfigEntry<Object, Property, string | null> {
  return {
    headerLabel,
    order,
    viewComponent: (value) => (
      <Box
        key={"image-prop-view"}
        sx={{
          height: "2em",
          width: "min-content",
          padding: "0 0.25em",
        }}
      >
        {value && <AvatarIconImage imageLink={value} />}
      </Box>
    ),
    editorComponent: (value, onChange) => (
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
