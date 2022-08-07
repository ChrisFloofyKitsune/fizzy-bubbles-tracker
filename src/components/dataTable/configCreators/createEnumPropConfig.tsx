import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, Box, SelectItem, Select } from "@mantine/core";

export function createSelectPropConfig<T extends {}, P extends keyof T>(
  selectOptions: SelectItem[],
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P> {
  return {
    headerLabel,
    order,
    viewComponent: (value: any) => (
      <Box
        key={"select-prop-view"}
        sx={{
          minHeight: "2em",
          padding: "0 0.25em",
        }}
      >
        <Text key={"select-prop-text"}>{value ?? ""}</Text>
      </Box>
    ),
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => (
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
          key={"select-prop-input"}
          data={selectOptions}
          variant="unstyled"
          searchable
          sx={{
            ".mantine-Select-input": {
              height: "2em",
            },
          }}
          value={(value as string) ?? ""}
          onChange={async (value) => await onChange(value)}
        />
      </Box>
    ),
  };
}
