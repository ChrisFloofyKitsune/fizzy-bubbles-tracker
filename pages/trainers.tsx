import {
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import { Trainer } from "~/orm/entities";
import { useRepository, waitForTransactions } from "~/services";
import { BBCodeArea, EditModeToggle } from "~/components";
import { EntityEditor } from "~/components/input/entityEditor";
import { waitUntil } from "async-wait-until";
import { AddIcon } from "~/appIcons";
import { useAsyncEffect } from "use-async-effect";

const TrainersPage: NextPage = () => {
  const repo = useRepository(Trainer);
  const [entityList, setEntityList] = useState<Trainer[]>([]);
  const [selected, setSelected] = useState<Trainer>();

  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitForTransactions(repo);
    const list = await repo.find();
    setEntityList(list);
    setSelected(selected ?? list[0] ?? undefined);
  }, [repo]);

  const createNewTrainer = useCallback(() => {
    return repo?.create({
      name: "New Trainer",
      bbcodeProfile: `Trainer Name: {{name}}
Starter Pokemon: Species (MT or EM Move)
Background: Once upon a time {{name}} set out to be the best like no one ever was...`,
    }) as Trainer;
  }, [repo]);

  if (!repo) {
    return <>Loading...?</>;
  }

  return (
    <>
      <Stack>
        <Group>
          <Select
            sx={{
              width: "11em",
            }}
            data={entityList.map((t) => ({ label: t.name, value: t.uuid }))}
            value={selected?.uuid ?? "Loading..."}
            onChange={(uuid) =>
              setSelected(entityList.find((t) => t.uuid === uuid))
            }
          />
          <Title order={2} sx={{ flexGrow: 1, textAlign: "center" }}>
            Trainers
          </Title>
          <EditModeToggle
            ml="auto"
            checked={editModeOn}
            onToggle={setEditModeOn}
          />
        </Group>
        <Divider size="lg" />
        <Title order={3} sx={{ textAlign: "center" }}>{`${
          selected?.name ?? "No one"
        }'s Profile`}</Title>
        {!!selected ? (
          <></>
        ) : (
          <Button
            color="green"
            leftIcon={<AddIcon />}
            onClick={async () => {
              await waitUntil(
                () => repo && !repo.queryRunner?.isTransactionActive
              );
              const trainer = await repo!.save(createNewTrainer());
              setEntityList([trainer]);
              setSelected(trainer);
              setEditModeOn(true);
            }}
          >
            <Title order={5}>Create a Trainer to get started!</Title>
          </Button>
        )}
        {!editModeOn || !selected || !repo ? (
          <></>
        ) : (
          <EntityEditor
            targetEntity={selected}
            entityRepo={repo}
            confirmDeletePlaceholder={`${selected.name} has blacked out!`}
            // confirmDeletePlaceholder='D'
            createNewEntity={createNewTrainer}
            onAdd={(trainer) => {
              setEntityList(entityList.concat(trainer));
              setSelected(trainer);
            }}
            onUpdate={(updatedTrainers: Trainer[]) => {
              for (const trainer of updatedTrainers) {
                const index = entityList.findIndex(
                  (t) => t.uuid === trainer.uuid
                );
                entityList[index] = trainer;

                if (trainer.uuid === selected?.uuid) {
                  setSelected(trainer);
                }
              }

              setEntityList(entityList.slice());
            }}
            onConfirmedDelete={(trainer) => {
              const index = entityList.findIndex(
                (t) => t.uuid === trainer.uuid
              );
              const list = entityList.filter((t) => t.uuid !== trainer.uuid);
              setEntityList(list);
              setSelected(
                list.length === 0 ? undefined : list[Math.max(0, index - 1)]
              );
            }}
          >
            {(inputPropMap) => (
              <>
                <TextInput
                  required
                  label="Trainer Name"
                  {...inputPropMap.name}
                />
                <Textarea
                  label="[BBCode] Profile"
                  styles={{
                    input: { resize: "vertical" },
                  }}
                  minRows={6}
                  {...inputPropMap.bbcodeProfile}
                />
              </>
            )}
          </EntityEditor>
        )}
        <BBCodeArea
          label={`Trainer ${selected?.name ?? ""}`}
          bbCode={
            selected?.bbcodeProfile.replaceAll("{{name}}", selected.name) ?? ""
          }
        />
      </Stack>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default TrainersPage;
