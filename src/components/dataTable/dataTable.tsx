import {
  ActionIcon,
  Badge,
  Button,
  Center,
  createStyles,
  Pagination,
  Table,
  Text,
} from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddIcon, DeleteIcon } from "~/appIcons";
import { openConfirmModal } from "@mantine/modals";
import { CSSLengthPercentage } from "mantine-number-size-fix";
import { TbArrowDown, TbArrowUp } from "react-icons/tb";

export type PropConfigEntry<T, P extends keyof T> = {
  headerLabel: string;
  viewComponent: (value: T[P]) => JSX.Element;
  editorComponent: (
    value: T[P],
    onChange: (value: T[P]) => Promise<void>
  ) => JSX.Element;
  order?: number;
};

export type PropConfig<T> = {
  [P in keyof T]?: PropConfigEntry<T, P>;
};

export type DataTableCallbacks<T extends {}> = {
  add?: () => Promise<void>;
  edit?: (rowObj: T, prop: keyof T, value: T[typeof prop]) => Promise<void>;
  remove?: (rowObj: T) => Promise<void>;
  onRowReorder?: (rowObj: T, newPosition: number) => void | Promise<void>;
};

export type DataTableProps<T extends {}> = {
  rowObjs: T[];
  rowObjToId: (rowObj: T) => number | string;
  isEditMode?: boolean;
  propConfig?: PropConfig<T>;
  propsToMantineClasses?: Record<keyof T, string> | {};
  rowsPerPage?: number;
  minHeightPerRow?: CSSLengthPercentage;
  startingPage?: number;
  onPageChange?: (pageNumber: number) => void;
  allowRowReordering?: boolean;
} & DataTableCallbacks<T>;

type tableStyleProps = {
  minHeightPerRow: CSSLengthPercentage;
};
const useTableStyles = createStyles(
  (theme, { minHeightPerRow }: tableStyleProps) => ({
    tableBody: {
      tr: {
        minHeight: minHeightPerRow,
      },
    },
    fillerRow: {
      display: "block",
      width: 0,
    },
  })
);

const removeColumnStyle = createStyles({
  remove: {
    width: "5.5em",
    "& button": {
      margin: "0 auto",
    },
  },
  reorder: {
    width: "5.5em",
    "& span": {
      display: "flex",
    },
    "& button": {
      margin: "0 auto",
      borderRadius: "0.75em",
      "&:first-of-type": {
        borderTopRightRadius: "0",
        borderBottomRightRadius: "0",
      },
      "&:last-of-type": {
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
      },
    },
  },
});

export function DataTable<T extends {}>({
  rowObjs,
  rowObjToId,
  isEditMode = false,
  propConfig = {} as PropConfig<T>,
  propsToMantineClasses = {},
  rowsPerPage = 10,
  minHeightPerRow = "43px",
  startingPage = 1,
  onPageChange,
  allowRowReordering = false,
  add,
  edit,
  remove,
  onRowReorder,
}: DataTableProps<T>): JSX.Element {
  const myStyles = removeColumnStyle();
  const myClasses = useMemo(() => {
    return Object.assign({}, myStyles.classes, propsToMantineClasses);
  }, [myStyles.classes, propsToMantineClasses]) as Record<keyof T, string> &
    Record<"remove" | "reorder", string>;

  type sortedConfigEntry = [keyof T, PropConfigEntry<T, keyof T>];
  const sortedConfig: sortedConfigEntry[] = useMemo(() => {
    return (Object.entries(propConfig) as sortedConfigEntry[]).sort(
      (a, b) => (a[1].order ?? 0) - (b[1].order ?? 0)
    );
  }, [propConfig]);

  const headers = useMemo(() => {
    const result = sortedConfig.map(([prop, { headerLabel }]) => (
      <th key={`header-${String(prop)}`}>{headerLabel}</th>
    ));

    if (isEditMode && allowRowReordering)
      result.push(
        <th key={`header-reorder`} className={myClasses.reorder}>
          <Text align="center">Reorder</Text>
        </th>
      );

    if (isEditMode)
      result.push(
        <th key={`header-remove`} className={myClasses.remove}>
          <Text align="center">Remove</Text>
        </th>
      );

    return result;
  }, [
    allowRowReordering,
    isEditMode,
    myClasses.remove,
    myClasses.reorder,
    sortedConfig,
  ]);

  const myRowObjs = useMemo(() => rowObjs.filter((r) => !!r), [rowObjs]);

  const openDeleteConfirm = useCallback(
    (log: T) =>
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
      }),
    [remove]
  );

  const sendReorderEvent = useCallback(
    async (rowObj: T, isUpwards: boolean) => {
      const newIndex = Math.max(
        0,
        Math.min(
          rowObjs.length - 1,
          rowObjs.indexOf(rowObj) + (isUpwards ? -1 : 1)
        )
      );
      await onRowReorder?.(rowObj, newIndex);
    },
    [onRowReorder, rowObjs]
  );

  const tableStyles = useTableStyles({
    minHeightPerRow,
  });

  const [page, setPage] = useState<number>(startingPage);
  const totalPages = useMemo(
    () => Math.ceil(myRowObjs.length / rowsPerPage),
    [myRowObjs.length, rowsPerPage]
  );
  useEffect(() => {
    if (page > totalPages && page > 1) {
      const fixedPage = Math.max(1, totalPages);
      setPage(fixedPage);
      onPageChange?.(fixedPage);
    } else {
      onPageChange?.(page);
    }
  }, [onPageChange, page, totalPages]);

  const pageRowObjs = useMemo(
    () => myRowObjs.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [myRowObjs, page, rowsPerPage]
  );

  const fillerRows = useMemo(() => {
    const length = rowsPerPage - pageRowObjs.length;
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(
        <tr
          key={`filler-row-${i}`}
          className={tableStyles.classes.fillerRow}
        ></tr>
      );
    }
    return result;
  }, [pageRowObjs.length, rowsPerPage, tableStyles.classes.fillerRow]);

  return (
    <Table striped highlightOnHover={isEditMode} sx={{ tableLayout: "fixed" }}>
      <thead
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "#1a1a1a",
          boxShadow: "inset 0px -1px #555",
        }}
      >
        <tr>{headers}</tr>
      </thead>
      <tbody className={tableStyles.classes.tableBody}>
        {pageRowObjs.map((row) => {
          const index = rowObjs.indexOf(row);
          let reorderFlags = ReorderFlags.NONE;
          if (allowRowReordering) {
            if (index > 0) {
              reorderFlags |= ReorderFlags.UP;
            }
            if (index < rowObjs.length - 1) {
              reorderFlags |= ReorderFlags.DOWN;
            }
          }
          return (
            <DataTableRow
              key={`data-table-row-${rowObjToId(row)}`}
              id={rowObjToId(row)}
              rowObj={row}
              sortedConfig={sortedConfig}
              classes={myClasses}
              edit={edit}
              editMode={isEditMode}
              onDelete={openDeleteConfirm}
              reorderingAllowed={allowRowReordering}
              reorderFlags={reorderFlags}
              onReorder={sendReorderEvent}
            />
          );
        })}
        {fillerRows}
      </tbody>
      <tfoot
        style={{
          position: "sticky",
          bottom: "0",
          zIndex: 1,
          backgroundColor: "#1a1a1a",
          boxShadow: "inset 0px 1px #555",
        }}
      >
        <tr>
          {isEditMode && (
            <th>
              <Button
                leftIcon={<AddIcon />}
                onClick={async () => {
                  await add?.();
                  if (pageRowObjs.length === rowsPerPage) {
                    setPage(totalPages + 1);
                  }
                }}
                size="xs"
              >
                Add Entry
              </Button>
            </th>
          )}
          <th colSpan={headers.length - (isEditMode ? 1 : 0)}>
            <Pagination
              position="right"
              size="sm"
              withEdges
              page={page}
              onChange={setPage}
              total={totalPages}
            />
          </th>
        </tr>
      </tfoot>
    </Table>
  );
}

const enum ReorderFlags {
  NONE = 0b00,
  UP = 0b01,
  DOWN = 0b10,
}

type DataTableRowProps<T extends {}> = {
  id: string | number;
  rowObj: T;
  sortedConfig: [keyof T, PropConfigEntry<T, keyof T>][];
  classes: Record<keyof T, string> & Record<"remove" | "reorder", string>;
  edit?: DataTableCallbacks<T>["edit"];
  editMode: boolean;
  onDelete?: (rowObj: T) => void;
  reorderingAllowed: boolean;
  reorderFlags: ReorderFlags;
  onReorder?: (rowObj: T, isUpwards: boolean) => Promise<void>;
};

function DataTableRow<T extends {}>({
  id,
  rowObj,
  sortedConfig,
  classes,
  edit,
  editMode,
  onDelete,
  reorderingAllowed,
  reorderFlags,
  onReorder,
}: DataTableRowProps<T>) {
  return (
    <tr key={`row-${id}`}>
      {sortedConfig.map(([prop, config]) => (
        <td key={`row-${id}-${String(prop)}`} className={classes[prop] ?? ""}>
          <div key={`row-${id}-${String(prop)}-view`} hidden={editMode}>
            {config.viewComponent(rowObj[prop])}
          </div>
          <div key={`row-${id}-${String(prop)}-edit`} hidden={!editMode}>
            {config.editorComponent(
              rowObj[prop],
              async (value) => await edit?.(rowObj, prop, value)
            )}
          </div>
        </td>
      ))}
      {editMode && reorderingAllowed && (
        <td key={`row-${id}-reorder`} className={classes.reorder}>
          <span>
            <ActionIcon
              variant="filled"
              onClick={() => onReorder?.(rowObj, true)}
              disabled={!(reorderFlags & ReorderFlags.UP)}
            >
              <TbArrowUp />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              onClick={() => onReorder?.(rowObj, false)}
              disabled={!(reorderFlags & ReorderFlags.DOWN)}
            >
              <TbArrowDown />
            </ActionIcon>
          </span>
        </td>
      )}
      {editMode && (
        <td key={`row-${id}-remove`} className={classes.remove}>
          <ActionIcon
            variant="filled"
            color="red"
            onClick={() => onDelete?.(rowObj)}
          >
            <DeleteIcon />
          </ActionIcon>
        </td>
      )}
    </tr>
  );
}
