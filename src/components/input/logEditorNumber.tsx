import { PropToEditorComponentPair } from "~/components/input/logEditor";
import { ChangeLogBase } from "~/orm/entities";
import { Text, Box, NumberInput } from "@mantine/core";

export function numberPropToEditor<T extends ChangeLogBase, P extends keyof T>(
  prop: P
): PropToEditorComponentPair<T, P> {
  return {
    prop,
    toComponent: (log, isEditMode, onChange) => {
      const value = log[prop];
      if (value === null || typeof value === "number") {
        return NumberPropEditor({
          value: value as unknown as number | null,
          isEditMode,
          onChange,
        });
      } else {
        throw new Error(
          "Must pass in a prop gets a number from the log object. Got: " + value
        );
      }
    },
  };
}

type NumberPropEditorProps = {
  value: number | null;
  isEditMode: boolean;
  onChange: (value: any) => Promise<void>;
};
function NumberPropEditor({
  value,
  isEditMode,
  onChange,
}: NumberPropEditorProps): JSX.Element {
  return (
    <Box
      sx={{
        borderRadius: "0.25em",
        height: "2em",
        padding: "0 0.25em",
      }}
    >
      {!isEditMode ? (
        <Text>{value ?? ""}</Text>
      ) : (
        <NumberInput
          size="sm"
          value={value ?? 0}
          onChange={async (value) =>
            typeof value !== "undefined" && onChange(value)
          }
          styles={{
            input: {
              minHeight: "2em",
              maxHeight: "2em",
            },
            control: {
              height: "0.5em",
            },
            wrapper: {
              height: "2em",
            },
          }}
        />
      )}
    </Box>
  );
}
