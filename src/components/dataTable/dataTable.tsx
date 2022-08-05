import {
  Badge,
  Text,
  Button,
  Table,
  ActionIcon,
  Center,
  createStyles,
  Pagination,
} from "@mantine/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddIcon, DeleteIcon } from "~/appIcons";
import { openConfirmModal } from "@mantine/modals";
import { CSSLengthPercentage } from "../../../typefixes.global";

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
};

export type DataTableProps<T extends {}> = {
  rowObjs: T[];
  rowObjToId: (rowObj: T) => number | string;
  isEditMode?: boolean;
  propConfig?: PropConfig<T>;
  propsToMantineClasses?: Record<keyof T, string> | {};
  rowsPerPage?: number;
  minHeightPerRow?: CSSLengthPercentage;
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
});

export function DataTable<T extends {}>({
  rowObjs,
  rowObjToId,
  isEditMode = false,
  propConfig = {} as PropConfig<T>,
  propsToMantineClasses = {},
  rowsPerPage = 10,
  minHeightPerRow = "43px",
  add,
  edit,
  remove,
}: DataTableProps<T>): JSX.Element {
  const myStyles = removeColumnStyle();
  const myClasses = useMemo(() => {
    return Object.assign({}, myStyles.classes, propsToMantineClasses);
  }, [myStyles.classes, propsToMantineClasses]) as Record<keyof T, string> &
    Record<"remove", string>;

  type sortedConfigEntry = [keyof T, PropConfigEntry<T, keyof T>];
  const sortedConfig: sortedConfigEntry[] = useMemo(() => {
    return (Object.entries(propConfig) as sortedConfigEntry[]).sort(
      (a, b) => (a[1].order ?? 0) - (b[1].order ?? 0)
    );
  }, [propConfig]);

  const headers = useMemo(() => {
    return sortedConfig.map(([prop, { headerLabel }]) => (
      <th key={`header-${String(prop)}`}>{headerLabel}</th>
    ));
  }, [sortedConfig]);

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

  const tableStyles = useTableStyles({
    minHeightPerRow,
  });

  const [page, setPage] = useState<number>(1);
  const totalPages = useMemo(
    () => Math.ceil(myRowObjs.length / rowsPerPage),
    [myRowObjs.length, rowsPerPage]
  );
  useEffect(() => {
    if (page > totalPages && page > 1) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

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
    <Table striped highlightOnHover={isEditMode}>
      <thead
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "#1a1a1a",
          boxShadow: "inset 0px -1px #555",
        }}
      >
        <tr>
          {headers}
          {isEditMode && (
            <th key={`header-remove`} className={myClasses.remove}>
              <Text align="center">Remove</Text>
            </th>
          )}
        </tr>
      </thead>
      <tbody className={tableStyles.classes.tableBody}>
        {pageRowObjs.map((row) => (
          <DataTableRow
            key={`data-table-row-${rowObjToId(row)}`}
            id={rowObjToId(row)}
            rowObj={row}
            sortedConfig={sortedConfig}
            classes={myClasses}
            edit={edit}
            editMode={isEditMode}
            onDelete={openDeleteConfirm}
          />
        ))}
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
          <th colSpan={headers.length}>
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

type DataTableRowProps<T extends {}> = {
  id: string | number;
  rowObj: T;
  sortedConfig: [keyof T, PropConfigEntry<T, keyof T>][];
  classes: Record<keyof T, string> & Record<"remove", string>;
  edit?: DataTableCallbacks<T>["edit"];
  editMode: boolean;
  onDelete?: (rowObj: T) => void;
};
function DataTableRow<T extends {}>({
  id,
  rowObj,
  sortedConfig,
  edit,
  editMode,
  onDelete,
  classes,
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
