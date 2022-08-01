import { NextPage } from "next";
import {
  Box,
  Button,
  FileButton,
  Paper,
  Select,
  Text,
  Title,
} from "@mantine/core";
import { useDataSource } from "~/services";
import { useEffect, useState } from "react";
import { EntityMetadata } from "typeorm";
import { SqlTable } from "~/components/sqlTable";
import { TbDownload, TbUpload, TbTableImport } from "react-icons/tb";
import { fileToWorkBook, getItemLogsFromWorkBook } from "~/spreadsheetFileUtil";
import { ItemDefinition, ItemLog } from "~/orm/entities";

export const DataPage: NextPage = () => {
  const [entityMetadata, setEntityMetadata] = useState<EntityMetadata[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<
    EntityMetadata | undefined
  >(undefined);
  const [changesPending, setChangesPending] = useState<boolean>(false);

  const ds = useDataSource();

  useEffect(() => {
    if (!ds) return;

    setEntityMetadata(ds.entityMetadatas.filter((e) => e.synchronize));
    setSelectedMetadata(ds.entityMetadatas[0]);
  }, [ds]);

  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);

  return (
    <>
      <Box mr="auto" mb="md">
        <Button leftIcon={<TbUpload size={20} />} disabled={true}>
          Import Data
        </Button>
        <Button ml="md" leftIcon={<TbDownload size={20} />} disabled={true}>
          Export Data
        </Button>
        <FileButton
          onChange={async (file) => {
            setSpreadsheetFile(file);
            if (file) {
              const wb = await fileToWorkBook(file);
              if (wb) {
                const logsAndDefs = getItemLogsFromWorkBook(wb);
                if (logsAndDefs) {
                  await ds
                    ?.getRepository(ItemDefinition)
                    .save(logsAndDefs.definitions);
                  await ds?.getRepository(ItemLog).save(logsAndDefs.logs);
                }
              }
            }
          }}
        >
          {(props) => (
            <Button {...props} ml="md" leftIcon={<TbTableImport size={20} />}>
              Import Spreadsheet
            </Button>
          )}
        </FileButton>
      </Box>
      <Select
        data={entityMetadata.map((e) => e.name)}
        value={selectedMetadata?.name ?? "Loading..."}
        onChange={(value) => {
          setSelectedMetadata(entityMetadata.find((e) => e.name === value));
        }}
        sx={{
          maxWidth: "15em",
        }}
        disabled={changesPending}
      />
      <Paper
        sx={{
          overflowX: "clip",
          maxWidth: "100%",
        }}
      >
        {!selectedMetadata || !ds ? (
          <Text>Loading...</Text>
        ) : (
          <Box pt="lg">
            <Title order={6}>{selectedMetadata.name}</Title>
            <SqlTable
              entityMetadata={selectedMetadata}
              dataSource={ds}
              changesPendingCallback={setChangesPending}
            />
          </Box>
        )}
      </Paper>
    </>
  );
};

export default DataPage;
