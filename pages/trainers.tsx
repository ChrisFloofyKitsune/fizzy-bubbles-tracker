import { Button, Divider, Group, Select, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { NextPage } from "next";
import { useEffect, useState } from 'react';
import useAsyncEffect from "use-async-effect";
import { Trainer } from "~/orm/entities";
import { useDataSource } from "~/services";
import { Repository } from "typeorm";
import { BBCodeArea, EditModeToggle } from "~/components";
import { EntityEditor } from '~/components/entityEditor';
import { waitUntil, WAIT_FOREVER } from 'async-wait-until';
import { AddIcon } from "~/appIcons";

const Trainers: NextPage = () => {

    const ds = useDataSource();

    const [repo, setRepo] = useState<Repository<Trainer>>();
    const [trainerList, setTrainerList] = useState<Trainer[]>([])
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer>();

    const [editModeOn, setEditModeOn] = useState<boolean>(false);

    useEffect(() => {
        setRepo(ds?.getRepository(Trainer));
    }, [ds]);

    useAsyncEffect(async () => {
        if (!repo) return;
        await waitUntil(() => !repo.queryRunner?.isTransactionActive, { timeout: WAIT_FOREVER });
        const list = await repo.find();
        setTrainerList(list);
        setSelectedTrainer(selectedTrainer ?? list[0] ?? undefined);
    }, [repo]);

    if (!ds) {
        return <>"Loading...?"</>;
    }

    return <>
        <Stack>
            <Group>
                <Select
                    data={trainerList.map(t => ({ label: t.name, value: t.uuid }))}
                    value={selectedTrainer?.uuid}
                    onChange={uuid => setSelectedTrainer(trainerList.find(t => t.uuid === uuid))}
                />
                <EditModeToggle
                    ml='auto'
                    checked={editModeOn}
                    onToggle={setEditModeOn}
                />
            </Group>
            <Divider size='lg' />
            <Title order={3} sx={{ textAlign: 'center' }}>{`${selectedTrainer?.name ?? 'No one'}'s Profile`}</Title>
            {!!selectedTrainer ? <></> :
                <Button
                    color='green'
                    leftIcon={<AddIcon />}
                    onClick={async () => {
                        await waitUntil(() => repo && !repo.queryRunner?.isTransactionActive);
                        const trainer = await repo!.save(repo!.create({
                            name: 'New Trainer'
                        }));
                        setTrainerList([trainer]);
                        setSelectedTrainer(trainer);
                        setEditModeOn(true);
                    }}
                >
                    <Title order={5}>Create a Trainer to get started!</Title>
                </Button>
            }
            {(!editModeOn || !selectedTrainer || !repo) ? <></> :
                <EntityEditor
                    entityId={selectedTrainer.uuid}
                    targetEntity={selectedTrainer}
                    entityRepo={repo}
                    confirmDeletePlaceholder={`${selectedTrainer.name} has blacked out!`}
                    // confirmDeletePlaceholder='D'
                    onAdd={trainer => {
                        setTrainerList(trainerList.concat(trainer));
                        setSelectedTrainer(trainer);
                    }}
                    onUpdate={trainer => {
                        setSelectedTrainer(trainer);
                        const index = trainerList.findIndex(t => t.uuid === trainer.uuid);
                        trainerList[index] = trainer;
                        setTrainerList(trainerList.slice());
                    }}
                    onConfirmedDelete={trainer => {
                        const index = trainerList.findIndex(t => t.uuid === trainer.uuid);
                        const list = trainerList.filter(t => t.uuid !== trainer.uuid);
                        setTrainerList(list);
                        setSelectedTrainer(list.length === 0 ? undefined : list[Math.max(0, index - 1)]);

                    }}
                >
                    {inputPropMap => <>
                        <TextInput
                            size='lg'
                            required
                            label='Trainer Name'
                            {...inputPropMap.name}
                        />
                        <Textarea
                            label='[BBCode] Profile'
                            styles={{
                                input: { resize: 'vertical' }
                            }}
                            minRows={6}
                            {...inputPropMap.bbcodeProfile}
                        />
                    </>}
                </EntityEditor>
            }
            <BBCodeArea
                label={`Trainer ${selectedTrainer?.name ?? ''}`}
                bbCode={selectedTrainer?.bbcodeProfile.replaceAll('{{name}}', selectedTrainer.name) ?? ''}
            />
        </Stack>
    </>
}

export default Trainers;
