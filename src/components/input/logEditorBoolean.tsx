import { PropToEditorComponentPair } from "~/components/input/logEditor";
import { ChangeLogBase } from "~/orm/entities";
import { ActionIcon, ThemeIcon, Center } from "@mantine/core";
import { TbCheck, TbX } from "react-icons/tb";

export function booleanPropToEditor<T extends ChangeLogBase, P extends keyof T>(
  prop: P
): PropToEditorComponentPair<T, P> {
  return {
    prop,
    toComponent: (log, isEditMode, onChange) => {
      const value = log[prop];
      if (value === null || typeof value === "boolean") {
        return BooleanPropEditor({
          value: (value as unknown as boolean | null) ?? false,
          isEditMode,
          onChange,
        });
      } else {
        throw new Error(
          "Must pass in a prop gets a boolean from the log object."
        );
      }
    },
  };
}

type BooleanPropEditorProps = {
  value: boolean;
  isEditMode: boolean;
  onChange: (value: any) => Promise<void>;
};
function BooleanPropEditor({
  value,
  isEditMode,
  onChange,
}: BooleanPropEditorProps): JSX.Element {
  return (
    <Center>
      {!isEditMode ? (
        <ThemeIcon variant="outline" color={value ? "green" : "red"}>
          {value ? <TbCheck /> : <TbX />}
        </ThemeIcon>
      ) : (
        <ActionIcon
          variant="filled"
          color={value ? "green" : "red"}
          size="26px"
          onClick={async () => await onChange(!value)}
        >
          {value ? <TbCheck /> : <TbX />}
        </ActionIcon>
      )}
    </Center>
  );
}
