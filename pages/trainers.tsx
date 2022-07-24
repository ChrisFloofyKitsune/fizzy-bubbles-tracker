import { Button, Divider, Group, Select, Stack, Textarea, TextInput, Title } from "@mantine/core";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react';
import useAsyncEffect from "use-async-effect";
import { Trainer } from "~/orm/entities";
import { useDataSource } from "~/services";
import { AddIcon } from "~/appIcons";
import { Repository } from "typeorm";
import { BBCodeArea, EditModeToggle } from "~/components";
import { EntityEditor } from '~/components/entityEditor';
import { waitUntil, WAIT_FOREVER } from 'async-wait-until';
import { debounce } from '~/util';
import { useForm } from "@mantine/form";

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
                    checked={editModeOn}
                    onToggle={setEditModeOn}
                />
                <Button color='green' leftIcon={<AddIcon />}
                    onClick={async () => {
                        if (!repo) return;
                        const newTrainer = repo.create();
                        newTrainer.name = 'New Trainer';
                        await repo.save(newTrainer);
                        console.log(newTrainer.uuid);
                        setTrainerList(trainerList.concat(newTrainer));
                        setSelectedTrainer(newTrainer);
                    }}
                    disabled={!editModeOn}
                >
                    Create New Trainer
                </Button>
            </Group>
            <Divider size='lg' />
            <Title order={3} sx={{ textAlign: 'center' }}>{`${selectedTrainer?.name ?? 'No one'}'s Profile`}</Title>
            {
                (!editModeOn || !selectedTrainer || !repo) ? '' :
                    <EntityEditor
                        entityId={selectedTrainer.uuid}
                        targetEntity={selectedTrainer}
                        entityRepo={repo}
                        onUpdate={trainer => {
                            setSelectedTrainer(trainer);
                            const index = trainerList.findIndex(t => t.uuid === trainer.uuid);
                            if (index !== -1) {
                                trainerList[index] = trainer;
                                setTrainerList(trainerList.slice());
                            }
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
                bbCode={selectedTrainer?.bbcodeProfile ?? ''}
            />
        </Stack>
    </>
}

export default Trainers;
