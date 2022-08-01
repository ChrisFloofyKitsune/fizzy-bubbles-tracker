import { PropToEditorComponentPair } from "~/components/input/logEditor";
import { ChangeLogBase } from "~/orm/entities";
import { Text, TextInput, Box } from "@mantine/core";

export function stringPropToEditor<T extends ChangeLogBase, P extends keyof T>(
  prop: P
): PropToEditorComponentPair<T, P> {
  return {
    prop,
    toComponent: (log, isEditMode, onChange) => {
      const value = log[prop];
      if (value === null || typeof value === "string") {
        return StringPropEditor({
          value: value as unknown as string | null,
          isEditMode,
          onChange,
        });
      } else {
        throw new Error(
          "Must pass in a prop gets a string from the log object."
        );
      }
    },
  };
}

type StringPropEditorProps = {
  value: string | null;
  isEditMode: boolean;
  onChange: (value: any) => Promise<void>;
};
function StringPropEditor({
  value,
  isEditMode,
  onChange,
}: StringPropEditorProps): JSX.Element {
  return (
    <Box
      sx={(theme) => ({
        boxShadow: isEditMode
          ? "inset 0px 0px 1px 1px" + theme.colors.gray[7]
          : "unset",
        borderRadius: "0.25em",
        minHeight: "2em",
        padding: "0 0.25em",
      })}
    >
      {!isEditMode ? (
        <Text>{value ?? ""}</Text>
      ) : (
        <TextInput
          variant="unstyled"
          sx={{
            ".mantine-Input-input": {
              minHeight: "2em",
            },
          }}
          value={value ?? ""}
          onChange={async (event) => await onChange(event.currentTarget.value)}
        />
      )}
    </Box>
  );
}
