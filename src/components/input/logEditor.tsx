import { ChangeLogBase, ShopTrackedChangeLog } from "~/orm/entities";
import {
  Badge,
  Text,
  Button,
  Table,
  ActionIcon,
  Center,
  createStyles,
} from "@mantine/core";
import { ReactNode, useMemo } from "react";
import { AddIcon, DeleteIcon } from "~/appIcons";
import { openConfirmModal } from "@mantine/modals";
import { DatePropEditor } from "~/components/input/logEditorDate";
import { stringPropToEditor } from "~/components/input/logEditorString";
import { booleanPropToEditor } from "~/components/input/logEditorBoolean";

export type PropToLabelPair<T> = { prop: keyof T; label: ReactNode };
export type PropToEditorComponentPair<T, P extends keyof T> = {
  prop: P;
  toComponent: (
    log: T,
    isEditMode: boolean,
    onChange: (value: T[P]) => Promise<void>
  ) => JSX.Element;
};
export type PropToMantineClassPair<T> = { prop: keyof T; mantineClass: string };

type MapPropComp<T> = {
  [P in keyof T as string]: PropToEditorComponentPair<T, P>;
};

export type LogEditorCallbacks<T extends ChangeLogBase | ShopTrackedChangeLog> =
  {
    filter?: (log: T) => boolean;
    add?: () => Promise<void>;
    edit?: (log: T, prop: keyof T, value: T[typeof prop]) => Promise<void>;
    remove?: (log: T) => Promise<void>;
  };
export type LogEditorProps<T extends ChangeLogBase> = {
  logs: T[];
  isShopLog: T extends ShopTrackedChangeLog ? true : false;
  isEditMode?: boolean;
  propsToLabelsPairs?: PropToLabelPair<T>[];
  propsToEditorComponentPairs?: PropToEditorComponentPair<T, keyof T>[];
  propsToMantineClasses?: Record<keyof T, string> | {};
} & LogEditorCallbacks<T>;

const useMyStyles = createStyles({
  date: {
    width: "6.5em",
  },
  verifiedInShopUpdate: {
    width: "8.25em",
  },
  remove: {
    width: "5.5em",
    "& button": {
      margin: "0 auto",
    },
  },
});

export function LogEditor<T extends ChangeLogBase | ShopTrackedChangeLog>({
  logs,
  isShopLog,
  isEditMode = false,
  propsToLabelsPairs = [],
  propsToEditorComponentPairs = [],
  propsToMantineClasses = {},
  filter,
  add,
  edit,
  remove,
}: LogEditorProps<T>): JSX.Element {
  const myLogs = useMemo(() => {
    return !filter ? logs : logs.filter(filter);
  }, [logs, filter]);

  const myProps: PropToLabelPair<T>[] = useMemo(() => {
    function concatNew<E extends PropToLabelPair<any>>(dest: E[], src: E[]) {
      return dest.concat(
        src.filter((s) => !dest.some((d) => s.prop === d.prop))
      );
    }
    let result = concatNew(propsToLabelsPairs, [
      { label: "Note", prop: "sourceNote" },
      { label: "Link", prop: "sourceUrl" },
    ]);
    if (isShopLog) {
      return concatNew(result as PropToLabelPair<ShopTrackedChangeLog>[], [
        { label: <Text sx={{ width: "6.5em" }}>Date</Text>, prop: "date" },
        {
          label: <Text align="right">Shop Verified?</Text>,
          prop: "verifiedInShopUpdate",
        },
      ]) as PropToLabelPair<T>[];
    }
    return result;
  }, [propsToLabelsPairs, isShopLog]);

  const myPropToCompMap: MapPropComp<T> = useMemo(() => {
    let result: MapPropComp<ChangeLogBase> = {};
    propsToEditorComponentPairs?.forEach((pair) => {
      const prop = pair.prop as string;
      (result as MapPropComp<any>)[prop] = pair as PropToEditorComponentPair<
        T,
        any
      >;
    });
    result["sourceNote"] = stringPropToEditor("sourceNote");
    result["sourceUrl"] = stringPropToEditor("sourceUrl");
    if (isShopLog) {
      (result as MapPropComp<ShopTrackedChangeLog>)["date"] = DatePropEditor;
      (result as MapPropComp<ShopTrackedChangeLog>)["verifiedInShopUpdate"] =
        booleanPropToEditor("verifiedInShopUpdate");
    }
    return result;
  }, [propsToEditorComponentPairs, isShopLog]) as unknown as MapPropComp<T>;

  const myStyles = useMyStyles();
  const myClasses = useMemo(
    () => Object.assign({}, myStyles.classes, propsToMantineClasses),
    [myStyles, propsToMantineClasses]
  ) as Record<keyof T, string> & Record<"remove", string>;

  return (
    <Table striped highlightOnHover={isEditMode} captionSide="bottom">
      <thead style={{ position: "sticky" }}>
        <tr>
          {myProps.map(({ label, prop }) => (
            <th key={`header-${String(prop)}`}>{label}</th>
          ))}
          {isEditMode && (
            <th key={`header-remove`} className={myClasses.remove}>
              <Text align="center">Remove</Text>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {myLogs.map((log) => (
          <tr key={log.id}>
            {myProps.map(({ prop }) => {
              let comp = myPropToCompMap[prop as string]?.toComponent(
                log,
                isEditMode,
                async (value) => await edit?.(log, prop, value)
              ) ?? <Text>{String(log[prop])}</Text>;
              return (
                <td
                  className={myClasses[prop] ?? ""}
                  key={`${log.id}-${String(prop)}`}
                >
                  {comp}
                </td>
              );
            })}
            {isEditMode && (
              <td key={`${log.id}-delete`} className={myClasses.remove}>
                <ActionIcon
                  variant="filled"
                  color="red"
                  onClick={() =>
                    openConfirmModal({
                      title: (
                        <Center sx={{ width: "100%" }}>
                          <Badge color="red" size="xl" variant="outline">
                            Confirm entry deletion
                          </Badge>
                        </Center>
                      ),
                      size: "xs",
                      centered: true,
                      withCloseButton: false,
                      groupProps: { sx: { justifyContent: "center" } },
                      cancelProps: { color: "yellow", variant: "outline" },
                      confirmProps: { color: "red" },
                      labels: { confirm: "Delete", cancel: "Cancel" },
                      styles: {
                        header: {
                          width: "100%",
                        },
                        title: {
                          width: "100%",
                          marginRight: 0,
                        },
                      },
                      onConfirm: async () => await remove?.(log),
                    })
                  }
                >
                  <DeleteIcon />
                </ActionIcon>
              </td>
            )}
          </tr>
        ))}
      </tbody>
      <caption>
        {isEditMode && (
          <Button leftIcon={<AddIcon />} onClick={add}>
            Add Entry
          </Button>
        )}
      </caption>
    </Table>
  );
}
