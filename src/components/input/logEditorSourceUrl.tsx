import { PropToEditorComponentPair } from "~/components/input/logEditor";
import { ChangeLogBase } from "~/orm/entities";
import { Box, Text, TextInput, Anchor } from "@mantine/core";

export const SourceUrlEditor: PropToEditorComponentPair<
  ChangeLogBase,
  "sourceUrl"
> = {
  prop: "sourceUrl",
  toComponent: (log, isEditMode, onChange) => {
    const value = log.sourceUrl;
    return (
      <Box
        sx={(theme) => ({
          boxShadow: isEditMode
            ? "inset 0px 0px 1px 1px" + theme.colors.gray[7]
            : "unset",
          borderRadius: "0.25em",
          height: "2em",
          maxWidth: "15em",
          padding: "0 0.25em",
        })}
      >
        {!isEditMode ? (
          !!value ? (
            <Anchor href={value} target="_blank">
              <Text
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
          ) : (
            <Text>{""}</Text>
          )
        ) : (
          <TextInput
            variant="unstyled"
            sx={{
              ".mantine-Input-input": {
                height: "2em",
              },
            }}
            value={value ?? ""}
            onChange={async (event) =>
              await onChange(event.currentTarget.value)
            }
          />
        )}
      </Box>
    );
  },
};
