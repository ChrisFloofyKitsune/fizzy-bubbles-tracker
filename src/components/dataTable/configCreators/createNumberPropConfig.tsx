import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, Box, NumberInput } from "@mantine/core";

export function createNumberPropConfig<
  Object extends {},
  Property extends keyof Object
>(
  prop: Property,
  headerLabel: string,
  order?: number
): PropConfigEntry<Object, Property, number> {
  return {
    headerLabel,
    order,
    viewComponent: (value: number) => (
      <Box
        key={"number-prop-view"}
        sx={{
          height: "2em",
          padding: "0 0.25em",
        }}
      >
        <Text key={"number-prop-value"} align="right">
          {value ?? ""}
        </Text>
      </Box>
    ),
    editorComponent: (
      value: number,
      onChange: (value: number) => Promise<void>
    ) => (
      <Box
        key={"number-prop-edit"}
        sx={{
          height: "2em",
          padding: "0 0.25em",
        }}
      >
        <NumberInput
          key={"number-prop-input"}
          size="sm"
          value={value ?? 0}
          onChange={async (value) => {
            if (typeof value !== "undefined") {
              await onChange(value);
            }
          }}
          styles={{
            input: {
              minHeight: "2em",
              maxHeight: "2em",
              textAlign: "right",
              paddingRight: "2em",
            },
            control: {
              height: "0.5em",
            },
            wrapper: {
              height: "2em",
            },
          }}
        />
      </Box>
    ),
  };
}
