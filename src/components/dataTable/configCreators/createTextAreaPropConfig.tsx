import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Text, Box, Textarea } from "@mantine/core";

export function createTextAreaPropConfig<T extends {}, P extends keyof T>(
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P> {
  return {
    headerLabel,
    order,
    viewComponent: (value: any) => (
      <Box
        key={"string-prop-view"}
        sx={(theme) => ({
          minHeight: "2em",
          padding: "0 0.25em",
        })}
      >
        <Text key={"string-prop-text"}>{value ?? ""}</Text>
      </Box>
    ),
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => (
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
          value={(value as string) ?? ""}
          onChange={async (event) => await onChange(event.currentTarget.value)}
        />
      </Box>
    ),
  };
}
