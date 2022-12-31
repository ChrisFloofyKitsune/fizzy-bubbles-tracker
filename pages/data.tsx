import { NextPage } from "next";
import { Box, Button, Paper, Select, Text, Title } from "@mantine/core";
import { useDataSource } from "~/services";
import { useEffect, useState } from "react";
import { EntityMetadata } from "typeorm";
import { SqlTable } from "~/components/sqlTable";
import { WarningIcon } from "~/appIcons";
import { openConfirmModal } from "@mantine/modals";

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
      <Button
        mt="xl"
        leftIcon={<WarningIcon />}
        color="red"
        rightIcon={<WarningIcon />}
        onClick={() =>
          openConfirmModal({
            title: <Title order={1}>RESET DATABASE!?</Title>,
            centered: true,
            size: "lg",
            children: (
              <Text>
                {`This will wipe ALL data and reset the database to "factory default".`}
                <br />
                {`If you're not actively developing this web app, you probably will never need to press this.`}
              </Text>
            ),
            labels: {
              cancel: "On second thought, NO.",
              confirm: "I'm sure",
            },
            onConfirm: async () => {
              if (!ds) return;
              await ds.dropDatabase();
              await ds.synchronize();
              await ds.runMigrations();
            },
          })
        }
      >
        RESET DATABASE
      </Button>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default DataPage;
