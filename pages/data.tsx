import { NextPage } from "next";
import { Box, Paper, Select, Text, Title } from "@mantine/core";
import { useDataSource } from "~/services";
import { useEffect, useState } from "react";
import { EntityMetadata } from "typeorm";
import { SqlTable } from "~/components/sqlTable";

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

  return (
    <>
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
