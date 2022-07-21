import { Blockquote, Box, Button, Center, Group, Select, Stack, Switch, Text, Textarea, TextInput, Title } from "@mantine/core";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { Trainer } from "~/orm/entities";
import { useAutoSaveCounter, useDataSource } from "~/services";
import { AddIcon, EditIcon } from "~/appIcons";
import { Repository } from "typeorm";
import { useDebouncedValue } from "@mantine/hooks";
import yabbcode from 'ya-bbcode';

const parser = new yabbcode({
    paragraph: false,
    cleanUnmatchable: false,
    newline: true,
})

const Trainers: NextPage = () => {

    const ds = useDataSource();
    const autoSaveCount = useAutoSaveCounter();
    
    const [repo, setRepo] = useState<Repository<Trainer>>();
    const [trainerList, setTrainerList] = useState<Trainer[]>([])
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer>();
    const [debouncedTrainer] = useDebouncedValue(selectedTrainer, 500);
    const repoBusy = useRef(false);
    const [editModeOn, setEditModeOn] = useState<boolean>(false);

    useEffect(() => {
        setRepo(ds?.getRepository(Trainer));
    }, [ds]);

    useAsyncEffect(async () => {
        if (!repo || repoBusy.current) return;
        repoBusy.current = true;
        const list = await repo.find();
        repoBusy.current = false;
        setTrainerList(list);
        setSelectedTrainer(selectedTrainer ?? list[0] ?? undefined);
    }, [repo, autoSaveCount]);

    useAsyncEffect(async () => {
        if (!repo || !debouncedTrainer || repoBusy.current) return;
        console.log("STARTED SAVE");
        repoBusy.current = true;
        await repo.save(debouncedTrainer);
        repoBusy.current = false;
    }, () => { repoBusy.current = false }, [repo, debouncedTrainer]);

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
                <Switch
                    size='lg'
                    mx='auto'
                    label={<Center><EditIcon/><Text weight='bold'>Edit Mode</Text></Center>}
                    offLabel='OFF'
                    onLabel='ON'
                    checked={editModeOn}
                    onChange={event => setEditModeOn(event.currentTarget.checked)}
                />
                <Button color='green' leftIcon={<AddIcon />}
                    onClick={async() => {
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
            <Title order={3} sx={{ textAlign: 'center' }}>{`${selectedTrainer?.name ?? 'No one'}'s Profile`}</Title>
            {
                (!editModeOn || !selectedTrainer || !repo) ? '' : <>
                    <TextInput
                        label='Trainer Name'
                        size='lg'
                        required
                        value={selectedTrainer.name}
                        onChange={event => {
                            const val = event.currentTarget.value;
                            selectedTrainer.name = val;
                            setSelectedTrainer(Object.assign({}, selectedTrainer));
                        }}
                    />
                    <Textarea
                        minRows={10}
                        value={selectedTrainer.bbcodeProfile}
                        onChange={event => {
                            const val = event.currentTarget.value;
                            selectedTrainer.bbcodeProfile = val;
                            setSelectedTrainer(Object.assign({}, selectedTrainer));
                        }}
                    >

                    </Textarea>
                </> 
            }
            <Box dangerouslySetInnerHTML={{ __html: parser.parse(selectedTrainer?.bbcodeProfile ?? '') }}>

            </Box>
        </Stack>
    </>
}

export default Trainers;
