import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, TextInput, Box } from "@mantine/core";

export function createStringPropConfig<
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
        key={"string-prop-view"}
        sx={() => ({
          minHeight: "2em",
          padding: "0 0.25em",
        })}
      >
        <Text key={"string-prop-text"}>{value ?? ""}</Text>
      </Box>
    ),
    editorComponent: (value, onChange) => (
      <Box
        key={"string-prop-edit"}
        sx={(theme) => ({
          boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
          borderRadius: "0.25em",
          height: "2em",
          padding: "0 0.25em",
        })}
      >
        <TextInput
          key={"string-prop-input"}
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
