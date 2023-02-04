import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { Box, Text, TextInput, Anchor } from "@mantine/core";

export function createUrlPropConfig<
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
        key={"url-prop-view"}
        sx={{
          height: "2em",
          padding: "0 0.25em",
        }}
      >
        {value && (
          <Anchor key={"url-prop-anchor"} href={value} target="_blank">
            <Text
              key={"url-prop-value"}
              sx={{
                direction: "rtl",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {value}
            </Text>
          </Anchor>
        )}
      </Box>
    ),
    editorComponent: (value, onChange) => (
      <Box
        key={"url-prop-edit"}
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
