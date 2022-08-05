import { PropConfigEntry } from "~/components/dataTable/dataTable";
import { ActionIcon, ThemeIcon, Center } from "@mantine/core";
import { TbCheck, TbX } from "react-icons/tb";

export function createBooleanPropConfig<T extends {}, P extends keyof T>(
  prop: P,
  headerLabel: string,
  order?: number
): PropConfigEntry<T, P> {
  return {
    headerLabel,
    order,
    viewComponent: (value: any) => (
      <Center key={"bool-prop-view"}>
        <ThemeIcon
          key={"bool-prop-icon"}
          variant="outline"
          color={value ? "green" : "red"}
        >
          {value ? <TbCheck key={"check"} /> : <TbX key={"x"} />}
        </ThemeIcon>
      </Center>
    ),
    editorComponent: (value: any, onChange: (value: any) => Promise<void>) => (
      <Center key={"bool-prop-edit"}>
        <ActionIcon
          key={"bool-prop-action-icon"}
          variant="filled"
          color={value ? "green" : "red"}
          size="26px"
          onClick={async () => await onChange(!value)}
        >
          {value ? <TbCheck key={"check"} /> : <TbX key={"x"} />}
        </ActionIcon>
      </Center>
    ),
  };
}
