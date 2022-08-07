import { Button, Group, InputBase, InputBaseProps, Stack } from "@mantine/core";
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { openModal, useModals } from "@mantine/modals";
import {
  DataTable,
  DataTableProps,
  PropConfig,
} from "~/components/dataTable/dataTable";
import { useListState } from "@mantine/hooks";
import { LogDataTable } from "~/components/dataTable/logDataTable";
import { CancelIcon, SaveIcon } from "~/appIcons";

export interface InputDataTableModalProps<T>
  extends Omit<InputBaseProps, "component"> {
  id?: string;
  valueToDisplayElement: (value: T[]) => ReactNode;
  onChange: (value: T[]) => void;
  modalTitle: ReactNode;
  modalProps: Omit<DataTableModalContentProps<T>, "state" | "saveCallback">;
}

type ForwardedButtonRef<T> = ForwardedRef<
  Omit<HTMLButtonElement, "value"> & { value: T[] }
>;
function Inner_InputDataTableModel<T>(
  {
    valueToDisplayElement,
    onChange,
    modalTitle,
    modalProps,
    ...props
  }: InputDataTableModalProps<T>,
  ref: ForwardedButtonRef<T>
) {
  const [value, setValue] = useState<T[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      ...(buttonRef.current as HTMLButtonElement),
      get value() {
        return value;
      },
      set value(value: T[]) {
        setValue(value);
      },
    }),
    [value]
  );

  return (
    <InputBase
      {...props}
      component="button"
      ref={buttonRef}
      onClick={() => {
        openModal({
          title: modalTitle,
          centered: true,
          size: "xl",
          children: (
            <DataTableModalContent
              {...modalProps}
              saveCallback={onChange}
              state={{ startingRowObjs: value }}
            />
          ),
        });
      }}
      styles={Object.assign({}, props.styles, {
        input: {
          cursor: props.disabled ? "not-allowed" : "pointer",
        },
      })}
    >
      {valueToDisplayElement(value)}
    </InputBase>
  );
}

export const InputDataTableModal = forwardRef(Inner_InputDataTableModel) as <T>(
  props: InputDataTableModalProps<T> & { ref?: ForwardedButtonRef<T> }
) => ReturnType<typeof Inner_InputDataTableModel<T>>;

interface DataTableModalContentProps<T> {
  state: {
    startingRowObjs?: T[];
    startingPage?: number;
  };
  rowObjToId: DataTableProps<T>["rowObjToId"];
  createRowObj: (rowsObjsCount: number) => T;
  rowObjFilter?: (rowObj: T) => boolean;
  prepareForSaveCallback: (rowObjs: T[]) => Promise<T[] | undefined | null>;
  saveCallback: (rowObjs: T[]) => void;
  dataTableType: "normal" | "changeLog" | "shopTrackedLog";
  propConfig: PropConfig<T>;
  propsToMantineClasses?: DataTableProps<T>["propsToMantineClasses"];
}
function DataTableModalContent<T>({
  state = {},
  rowObjToId,
  createRowObj,
  prepareForSaveCallback,
  rowObjFilter = () => true,
  saveCallback,
  dataTableType,
  propConfig,
  propsToMantineClasses = {},
}: DataTableModalContentProps<T>) {
  const modals = useModals();

  const [rowObjs, rowObjsHandler] = useListState<T>(
    state.startingRowObjs?.filter(rowObjFilter) ?? []
  );
  const [page, setPage] = useState(state.startingPage ?? 1);

  useEffect(() => {
    state.startingRowObjs = rowObjs;
    state.startingPage = page;
  }, [rowObjs, page, state]);

  const dataTableProps: Pick<
    DataTableProps<T>,
    | "isEditMode"
    | "rowObjToId"
    | "onPageChange"
    | "add"
    | "edit"
    | "remove"
    | "rowsPerPage"
    | "propConfig"
  > = useMemo(
    () => ({
      isEditMode: true,
      rowObjToId,
      onPageChange: setPage,
      add: async () => {
        const newObj = createRowObj(rowObjs.length);
        rowObjsHandler.append(newObj);
      },
      edit: async (rowObj, prop: any, value) => {
        const id = rowObjToId(rowObj);
        const index = rowObjs.findIndex((r) => rowObjToId(r) === id);
        rowObjsHandler.setItemProp(index, prop, value);
      },
      remove: async (rowObj) => {
        if (!state.startingRowObjs) return;
        const id = rowObjToId(rowObj);
        state.startingRowObjs = state.startingRowObjs.filter(
          (r) => rowObjToId(r) !== id
        );
      },
      rowsPerPage: 7,
      propConfig,
    }),
    [rowObjToId, propConfig, createRowObj, rowObjs, rowObjsHandler, state]
  );

  return (
    <Stack>
      {dataTableType === "normal" ? (
        <DataTable
          rowObjs={rowObjs}
          {...dataTableProps}
          propsToMantineClasses={propsToMantineClasses}
        />
      ) : (
        <LogDataTable
          rowObjs={rowObjs as any}
          isShopLog={dataTableType === "shopTrackedLog"}
          {...(dataTableProps as any)}
          propsToMantineClasses={propsToMantineClasses}
        />
      )}
      <Group position="right">
        <Button
          variant="outline"
          color="yellow"
          onClick={() => modals.closeAll()}
          leftIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          color="green"
          onClick={async () => {
            modals.closeAll();
            const preparedObjs = await prepareForSaveCallback(rowObjs);
            if (preparedObjs !== null && typeof preparedObjs !== "undefined") {
              saveCallback(preparedObjs);
            }
          }}
          leftIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}
