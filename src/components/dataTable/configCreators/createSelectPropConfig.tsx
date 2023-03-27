import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, Box, SelectItem, Select } from "@mantine/core";

export function createSelectPropConfig<
  Object extends {},
  Property extends keyof Object,
  Type extends string | null = string
>(
  selectOptions: SelectItem[],
  prop: Property,
  headerLabel: string,
  order?: number
): PropConfigEntry<Object, Property, Type> {
  return {
    headerLabel,
    order,
    viewComponent: (value) => (
      <Box
        key={"select-prop-view"}
        sx={{
          minHeight: "2em",
          padding: "0 0.25em",
        }}
      >
        <Text key={"select-prop-text"}>
          {selectOptions.find((opt) => opt.value === value)?.label ??
            value ??
            ""}
        </Text>
      </Box>
    ),
    editorComponent: (value, onChange) => (
      <Box
        key={"select-prop-edit"}
        sx={(theme) => ({
          boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
          borderRadius: "0.25em",
          height: "2em",
          padding: "0 0.25em",
        })}
      >
        <Select
          withinPortal
          key={"select-prop-input"}
          data={selectOptions}
          variant="unstyled"
          searchable
          sx={{
            ".mantine-Select-input": {
              height: "2em",
            },
          }}
          value={value ?? ""}
          onChange={async (value) => await onChange(value! as Type)}
        />
      </Box>
    ),
  };
}
