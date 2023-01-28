import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, Box, Textarea } from "@mantine/core";

export function createTextAreaPropConfig<
  Object extends {},
  Property extends keyof Object,
  AllowNull extends boolean = true
>(
  prop: Property,
  headerLabel: string,
  order?: number
): PropConfigEntry<
  Object,
  Property,
  AllowNull extends true ? string | null : string
> {
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
          minHeight: "2em",
          padding: "0 0.25em",
        })}
      >
        <Textarea
          key={"string-prop-input"}
          variant="unstyled"
          minRows={1}
          maxRows={5}
          autosize
          sx={{
            ".mantine-Input-input": {
              minHeight: "2em",
              fontSize: "14px",
              padding: "2px 2px",
            },
          }}
          value={value ?? ""}
          onChange={async (event) => await onChange(event.currentTarget.value)}
        />
      </Box>
    ),
  };
}
