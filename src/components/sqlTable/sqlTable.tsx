import { ReactNode, useCallback, useEffect, useState } from "react";
import DataGrid, {
  Column,
  RowsChangeData,
  SelectColumn,
  TextEditor,
} from "react-data-grid";
import { DataSource, EntityMetadata, TypeORMError } from "typeorm";
import { toHeaderCase } from "js-convert-case";
import { useAsyncEffect } from "use-async-effect";
import { classifyProp, PropType } from "./util";
import {
  Blockquote,
  Box,
  Button,
  Code,
  createStyles,
  Group,
  Paper,
  Text,
} from "@mantine/core";
import { sha1 } from "object-hash";
import { MdReportGmailerrorred } from "react-icons/md";
import { AddIcon, CancelIcon, DeleteIcon, SaveIcon } from "~/appIcons";
import { Dayjs, isDayjs } from "dayjs";

export type SqlTableProps = {
  entityMetadata: EntityMetadata;
  dataSource: DataSource;
  placeholder?: ReactNode;
  changesPendingCallback?: (changesPending: boolean) => void;
};

interface SqlColumn extends Column<any, any> {
  type?: PropType | null;
  required?: boolean;
}

enum RowState {
  EXISTS,
  NEW,
  CHANGED,
  DELETING,
}

interface SqlRow {
  [key: string]: any;
  state?: RowState;
  tempId: string;
  hash?: string;
}

const useStyles = createStyles((theme) => ({
  hiddenCol: {
    display: "none",
    width: 0,
  },
  requiredColHeader: {
    "&.rdg-cell::before": {
      content: '"* "',
      color: theme.colors.red[9],
    },
  },
  [RowState.NEW]: {
    ".rdg-cell": {
      backgroundColor: theme.fn.darken(theme.colors.green[5], 0.5),
    },
  },
  [RowState.CHANGED]: {
    ".rdg-cell": {
      backgroundColor: theme.fn.darken(theme.colors.yellow[5], 0.5),
    },
  },
  [RowState.DELETING]: {
    ".rdg-cell": {
      backgroundColor: theme.fn.darken(theme.colors.red[5], 0.5),
      textDecoration: "line-through",
    },
  },
}));

const defaultPlaceholder = <div>No data loaded</div>;

export function SqlTable({
  entityMetadata,
  dataSource,
  placeholder = defaultPlaceholder,
  changesPendingCallback = () => {},
}: SqlTableProps) {
  const tableStyles = useStyles();

  const [columns, setColumns] = useState<SqlColumn[]>([]);
  const [rows, setRows] = useState<SqlRow[] | null>(null);
  const [changesPending, setChangesPending] = useState<boolean>(false);
  const [refresher, setRefresher] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<Error>();
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>();

  // Turn metadata into columns/headers
  // Hook up editors
  useEffect(() => {
    const result: SqlColumn[] = [
      {
        key: "tempId",
        name: "Temp ID",
        required: false,
        minWidth: 0,
        width: 0,
        maxWidth: 0,
        headerCellClass: tableStyles.classes.hiddenCol,
        cellClass: () => tableStyles.classes.hiddenCol,
      },
      SelectColumn,
    ];

    for (const prop of Object.values(entityMetadata.propertiesMap)) {
      const propType = classifyProp(entityMetadata, prop);
      const colData = entityMetadata.findColumnWithPropertyName(prop);
      let required = false;

      if (colData) {
        required =
          !colData.isNullable &&
          !colData.isGenerated &&
          colData.default === undefined;
      }

      const columnOpts: SqlColumn = {
        type: propType,
        required,
        key: prop,
        name: (colData && colData.isPrimary ? "🔑 " : "") + toHeaderCase(prop),
        width: "calc(min-content + 2em)",
        resizable: true,
        summaryFormatter: () => <>{toHeaderCase(propType as string)}</>,
        headerCellClass: required
          ? tableStyles.classes.requiredColHeader
          : undefined,
        cellClass: () => `${prop}-cell`,
      };

      if (propType === PropType.TEXT) {
        Object.assign(columnOpts, {
          editable: true,
          editor: TextEditor,
        } as typeof columnOpts);
      }

      result.push(columnOpts);
    }

    setColumns(result);
    setSaveError(undefined);
    setChangesPending(false);
    changesPendingCallback(false);
    setSelectedRows(undefined);
  }, [
    tableStyles.classes.requiredColHeader,
    tableStyles.classes.hiddenCol,
    changesPendingCallback,
    entityMetadata,
    refresher,
  ]);

  // ASYNC get data and turn into rows
  useAsyncEffect(async () => {
    if (!entityMetadata) {
      setRows(null);
      return;
    }

    const results = await dataSource.getRepository(entityMetadata.name).find({
      loadEagerRelations: false,
      loadRelationIds: true,
    });

    const rows = [];

    for (const r of results as SqlRow[]) {
      Object.keys(r).forEach((k) => {
        if (r[k] === null) {
          r[k] = undefined;
        }

        if (isDayjs(r[k])) {
          r[k] = (r[k] as Dayjs).format("DD-MMM-YYYY");
        } else if (typeof r[k] === "object") {
          r[k] = JSON.stringify(r[k], null, 2);
        }
      });
      r.tempId = self.crypto.randomUUID();

      //ADD TEMP DATA
      r.hash = sha1(Object.assign({}, r));
      r.state = RowState.EXISTS;

      rows.push(r);
    }

    setRows(rows);
  }, [entityMetadata, refresher]);

  const onRowsChange = useCallback(
    (rows: SqlRow[], { indexes }: RowsChangeData<SqlRow>) => {
      for (const index of indexes) {
        const row = rows[index];
        if (row.state === RowState.EXISTS || row.state === RowState.CHANGED) {
          const temp = Object.assign({}, row);
          delete temp.hash;
          delete temp.state;
          row.state =
            sha1(temp) === row.hash ? RowState.EXISTS : RowState.CHANGED;
        }
      }

      const pending = !rows.every((r) => r.state === RowState.EXISTS);
      setChangesPending(pending);
      changesPendingCallback(pending);

      setRows(rows);
    },
    [changesPendingCallback]
  );

  const addRowFunc = useCallback(() => {
    const repo = dataSource.getRepository(entityMetadata.target);
    let newEntity = repo.create() as SqlRow;
    newEntity.tempId = self.crypto.randomUUID();
    newEntity.state = RowState.NEW;
    for (const prop of Object.values(entityMetadata.propertiesMap)) {
      newEntity[prop] = undefined;
    }
    setRows(rows!.concat(newEntity));
    setChangesPending(true);
    changesPendingCallback(true);
    setSaveError(undefined);
  }, [entityMetadata, rows, changesPendingCallback, dataSource]);

  const deleteRowFunc = useCallback(() => {
    const rowsToRemove: SqlRow[] = [];

    for (const selectedRowId of selectedRows!) {
      const row = rows!.find((r) => r.tempId === selectedRowId);

      if (!row) continue;

      if (row.state === RowState.NEW) {
        rowsToRemove.push(row);
      } else {
        row.state = RowState.DELETING;
      }
    }

    const changed = rows!.some((r) => r.state === RowState.DELETING);
    setChangesPending(changed);
    changesPendingCallback(changed);

    const _rows = rows!.filter((r) => !rowsToRemove.includes(r));
    setRows(_rows);
    setSelectedRows(undefined);
  }, [rows, selectedRows, changesPendingCallback]);

  const saveTableFunc = useCallback(async () => {
    setSaveError(undefined);
    const repo = dataSource.getRepository(entityMetadata.target);
    const changes = rows!.filter((r) => r.state !== RowState.EXISTS);

    changes.forEach((c) =>
      Object.keys(c).forEach((k) => (c[k] = c[k] === "" ? null : c[k]))
    );

    const rowsToSave = changes.filter((r) => r.state !== RowState.DELETING);
    const rowsToDelete = changes.filter((r) => r.state === RowState.DELETING);

    try {
      if (rowsToSave) await repo.save(rowsToSave);
      if (rowsToDelete) await repo.remove(rowsToDelete);
      setRefresher(!refresher);
    } catch (error: any) {
      if (error instanceof TypeORMError) {
        setSaveError(error);
      } else {
        throw error;
      }
    }
  }, [entityMetadata, rows, refresher, dataSource]);

  // NO HOOKS PAST THIS POINT //
  if (!columns || rows === null) {
    return <>{placeholder}</>;
  }

  return <>
    <Box
      sx={
        !saveError
          ? {}
          : {
              [`.state-${RowState.NEW}, .state-${RowState.CHANGED}`]: {
                [`& .${
                  saveError.message.match(/\.(?<prop>\w+)$/)?.groups?.prop
                }-cell`]: {
                  boxShadow: "inset 0 0 0 3px red",
                },
              },
            }
      }
    >
      <DataGrid
        columns={columns}
        rows={rows}
        rowKeyGetter={(row: SqlRow) => row.tempId}
        summaryRows={[{}]}
        rowClass={(row: SqlRow) =>
          (row && row.state ? tableStyles.classes[row.state] : "") +
          ` state-${row.state}`
        }
        onRowsChange={onRowsChange}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
      ></DataGrid>
    </Box>
    <Group mt="xs">
      <Button
        leftIcon={<AddIcon />}
        color="green"
        onClick={async () => await addRowFunc()}
      >
        Add Row
      </Button>
      <Button
        disabled={!selectedRows || selectedRows.size === 0}
        leftIcon={<DeleteIcon />}
        color="red"
        sx={{ marginRight: "auto" }}
        onClick={deleteRowFunc}
      >
        Remove Row(s)
      </Button>
      <Button
        disabled={!changesPending}
        leftIcon={<CancelIcon />}
        color="yellow"
        onClick={() => {
          setRefresher(!refresher);
        }}
      >
        Cancel Changes
      </Button>
      <Button
        disabled={!changesPending}
        leftIcon={<SaveIcon />}
        color="blue"
        onClick={async () => await saveTableFunc()}
      >
        Save Changes
      </Button>
    </Group>
    {!saveError ? (
      ""
    ) : (
      <Paper
        withBorder
        mt="xl"
        sx={(theme) => ({
          backgroundColor: theme.fn.darken(theme.colors.red[9], 0.5),
        })}
      >
        <Blockquote
          color="red"
          cite={
            <Text weight="bolder" sx={{ color: "white" }}>
              {saveError.name}
            </Text>
          }
          icon={<MdReportGmailerrorred size={32} />}
        >
          <Code color="red">{saveError.message}</Code>
        </Blockquote>
      </Paper>
    )}
  </>;
}
