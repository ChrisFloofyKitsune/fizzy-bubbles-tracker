import {
    Box,
    Button,
    createStyles,
    Divider,
    Group,
    Select,
    SelectItem,
    Stack,
    Textarea,
    TextInput,
    Title
} from "@mantine/core";
import {NextPage} from "next";
import {useDataSource} from "~/services";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Repository} from "typeorm";
import useAsyncEffect from "use-async-effect";
import {WAIT_FOREVER, waitUntil} from "async-wait-until";
import {Pokemon as dbPokemon, Trainer} from '~/orm/entities';
import {BBCodeFromTemplate, EditModeToggle, EntityEditor} from "~/components";
import {AddIcon} from "~/appIcons";
import {PokemonGenderOptions} from "~/orm/enums";

const useEditorStyle = createStyles(theme => ({
    editor: {
        display: 'grid',
        gap: '0.5em',
        [theme.fn.largerThan('md')]: {
            gridTemplateAreas:
                `nme spe dex typ abl
                 nat gen .   trn .
                 obt pkb hld .   .
                 obl pkl hll .   .
                 des des des des des
                 img img img img img
                 ev1 e2m ev2 e3m ev3
                 .   e2l .   e3l .
                 bqm bqm bqm bql bql`.split('\n').map(l => `"${l}"`).join(''),
        },
        [theme.fn.smallerThan('md')]: {
            gridTemplateAreas:
                `nme spe dex
                 typ abl nat
                 gen .   trn
                 obt pkb hld
                 obl pkl hll
                 des des des
                 img img img
                 ev1 ev2 ev3
                 .   e2m e3m
                 .   e2l e3l
                 bqm bqm bql`.split('\n').map(l => `"${l}"`).join(''),
        },

        '.input-name': {gridArea: 'nme'},
        '.input-species': {gridArea: 'spe'},
        '.input-dexNum': {gridArea: 'dex'},
        '.input-type': {gridArea: 'typ'},
        '.input-ability': {gridArea: 'abl'},
        '.input-nature': {gridArea: 'nat'},
        '.input-gender': {gridArea: 'gen'},
        '.input-image-link': {gridArea: 'img'},
        '.input-description': {gridArea: 'des'},
        '.input-evo-stage-1': {gridArea: 'ev1'},
        '.input-evo-stage-2-method': {gridArea: 'e2m'},
        '.input-evo-stage-2-method-link': {gridArea: 'e2l'},
        '.input-evo-stage-2': {gridArea: 'ev2'},
        '.input-evo-stage-3-method': {gridArea: 'e3m'},
        '.input-evo-stage-3-method-link': {gridArea: 'e3l'},
        '.input-evo-stage-3': {gridArea: 'ev3'},
        '.input-obtained': {gridArea: 'obt'},
        '.input-obtained-link': {gridArea: 'obl'},
        '.input-pokeball': {gridArea: 'pkb'},
        '.input-pokeball-link': {gridArea: 'pkl'},
        '.input-held-item': {gridArea: 'hld'},
        '.input-held-item-link': {gridArea: 'hll'},
        '.input-boutique-mods': {gridArea: 'bqm'},
        '.input-boutique-mods-link': {gridArea: 'bql'},
        '.input-trainer': {gridArea: 'trn'},
    }
}));

type dbClass = dbPokemon;
const Pokemon: NextPage = () => {

    const dbClass = dbPokemon;
    const ds = useDataSource();

    const [repo, setRepo] = useState<Repository<dbClass>>();
    const [entityList, setEntityList] = useState<dbClass[]>([]);
    const [selected, setSelected] = useState<dbClass>();

    const [editModeOn, setEditModeOn] = useState<boolean>(false);

    useEffect(() => {
        setRepo(ds?.getRepository(dbClass));
    }, [dbClass, ds]);

    useAsyncEffect(async () => {
        if (!repo) return;
        await waitUntil(() => !repo.queryRunner?.isTransactionActive, {timeout: WAIT_FOREVER});
        const list = await repo.find({
            loadEagerRelations: true,
        });
        setEntityList(list);
        setSelected(selected ?? list[0] ?? undefined);
    }, [repo]);

    const createNewPokemon = useCallback(() => {
        return repo?.create({
            name: "",
            species: "",
            dexNum: "???",
        }) as dbPokemon;
    }, [repo]);

    const editorStyle = useEditorStyle();

    const [genderOptions, setGenderOptions] = useState<SelectItem[]>([
        ['\xa0', PokemonGenderOptions.UNDECIDED],
        ['Genderless', PokemonGenderOptions.GENDERLESS],
        ['Male', PokemonGenderOptions.MALE],
        ['Female', PokemonGenderOptions.FEMALE]
    ].map(([l, v]) => ({label: l, value: v})));

    useEffect(() => {
        if (!selected) return;
        const g = selected.gender;
        if (g && !genderOptions.some(({value}) => value.toLowerCase() === g.toLowerCase())) {
            setGenderOptions((current) => current.concat({label: g, value: g}));
        }
    }, [genderOptions, selected]);

    const [trainerList, setTrainerList] = useState<Trainer[]>();
    useAsyncEffect(async () => {
        if (!ds) return;
        const tRepo = ds.getRepository(Trainer);
        await waitUntil(() => !tRepo.queryRunner?.isTransactionActive);
        const trainers = await ds.getRepository(Trainer).find({
            select: {
                uuid: true,
                name: true,
            }
        });
        setTrainerList(trainers);
    }, [ds]);

    const trainerOpts: SelectItem[] = useMemo(() => [
        { label: '\xa0', value: ''},
        ...trainerList?.map(t => ({label: t.name, value: t.uuid})) ?? []
    ], [trainerList]);

    if (!ds) {
        return <>Loading...?</>;
    }

    return <>
        <Stack>
            <Group>
                <Select
                    data={entityList.map(t => ({
                        label: `${t.name || 'Unnamed'} (${t.species || 'New Pokemon'})`,
                        value: t.uuid
                    }))}
                    value={selected?.uuid}
                    onChange={uuid => setSelected(entityList.find(t => t.uuid === uuid))}
                />
                <EditModeToggle
                    ml='auto'
                    checked={editModeOn}
                    onToggle={setEditModeOn}
                />
            </Group>
            <Divider size='lg'/>
            <Title order={3}
                   sx={{textAlign: 'center'}}>{`${selected?.name || selected?.species || 'A Pokemon'}'s Profile`}</Title>
            {!!selected ? <></> :
                <Button
                    color='green'
                    leftIcon={<AddIcon/>}
                    onClick={async () => {
                        await waitUntil(() => repo && !repo.queryRunner?.isTransactionActive);
                        const pokemon = await repo!.save(createNewPokemon());
                        setEntityList([pokemon]);
                        setSelected(pokemon);
                        setEditModeOn(true);
                    }}
                >
                    <Title order={5}>Create a Pokemon to get started!</Title>
                </Button>
            }
            {(!editModeOn || !selected || !repo) ? <></> :
                <EntityEditor
                    entityId={selected.uuid}
                    targetEntity={selected}
                    entityRepo={repo}
                    confirmDeletePlaceholder={`${selected.name || selected.species || "(New Pokemon)"} has fainted!`}
                    createNewEntity={createNewPokemon}
                    onAdd={pokemon => {
                        setEntityList(entityList.concat(pokemon));
                        setSelected(pokemon);
                    }}
                    onUpdate={pokemon => {
                        setSelected(pokemon);
                        const index = entityList.findIndex(t => t.uuid === pokemon.uuid);
                        entityList[index] = pokemon;
                        setEntityList(entityList.slice());
                    }}
                    onConfirmedDelete={pokemon => {
                        const index = entityList.findIndex(t => t.uuid === pokemon.uuid);
                        const list = entityList.filter(t => t.uuid !== pokemon.uuid);
                        setEntityList(list);
                        setSelected(list.length === 0 ? undefined : list[Math.max(0, index - 1)]);
                    }}
                >
                    {inputPropMap =>
                        <Box className={editorStyle.classes.editor}>
                            <TextInput
                                label='Pokemon Name'
                                id='input-name'
                                className='input-name'
                                {...inputPropMap.name}
                            />
                            <TextInput
                                label='Species'
                                id='input-species'
                                className='input-species'
                                {...inputPropMap.species}
                            />
                            <TextInput
                                label='Dex No.'
                                id='input-dexNum'
                                className='input-dexNum'
                                {...inputPropMap.dexNum}
                            />
                            <TextInput
                                label='Type'
                                id='input-type'
                                className='input-type'
                                {...inputPropMap.type}
                            />
                            <TextInput
                                label='Ability'
                                id='input-ability'
                                className='input-ability'
                                {...inputPropMap.ability}
                            />
                            <TextInput
                                label='Nature'
                                id='input-Nature'
                                className='input-nature'
                                {...inputPropMap.nature}
                            />
                            <Select
                                label='Gender'
                                id='input-gender'
                                className='input-gender'
                                data={genderOptions}
                                placeholder="Select or type"
                                searchable
                                creatable
                                getCreateLabel={(query) => `${query}`}
                                onCreate={(query) => {
                                    const freedomOfGenderExpression = {value: query, label: query};
                                    setGenderOptions((current) => current.concat(freedomOfGenderExpression));
                                    return freedomOfGenderExpression;
                                }}
                                {...inputPropMap.gender}
                            />
                            <Select
                                data={trainerOpts}
                                label="Owning Trainer"
                                id='input-trainer'
                                className='input-trainer'
                                value={selected?.trainerId ?? null}
                                onChange={async (value) => inputPropMap.trainerId!.onChange(value)}
                            />
                            <TextInput
                                label='Image Link'
                                id='input-image-link'
                                className='input-image-link'
                                {...inputPropMap.imageLink}
                            />
                            <Textarea
                                label='Description'
                                id='input-description'
                                className='input-description'
                                autosize={true}
                                minRows={3}
                                maxRows={6}
                                {...inputPropMap.bbcodeDescription}
                            />
                            <TextInput
                                label='Evolution Stage 1'
                                id='input-evo-stage-1'
                                className='input-evo-stage-1'
                                {...inputPropMap.evolutionStageOne}
                            />
                            <TextInput
                                label='Evolution Stage 2 Method'
                                id='input-evo-stage-2-method'
                                className='input-evo-stage-2-method'
                                {...inputPropMap.evolutionStageTwoMethod}
                            />
                            <TextInput
                                label='Evolution Stage 2 Method Link'
                                id='input-evo-stage-2-method-link'
                                className='input-evo-stage-2-method-link'
                                {...inputPropMap.evolutionStageTwoMethodLink}
                            />
                            <TextInput
                                label='Evolution Stage 2'
                                id='input-evo-stage-2'
                                className='input-evo-stage-2'
                                {...inputPropMap.evolutionStageTwo}
                            />
                            <TextInput
                                label='Evolution Stage 3 Method'
                                id='input-evo-stage-3-method'
                                className='input-evo-stage-3-method'
                                {...inputPropMap.evolutionStageThreeMethod}
                            />
                            <TextInput
                                label='Evolution Stage 3 Method Link'
                                id='input-evo-stage-3-method-link'
                                className='input-evo-stage-3-method-link'
                                {...inputPropMap.evolutionStageThreeMethod}
                            />
                            <TextInput
                                label='Evolution Stage 3'
                                id='input-evo-stage-3'
                                className='input-evo-stage-3'
                                {...inputPropMap.evolutionStageThree}
                            />
                            <TextInput
                                label='Obtained'
                                id='input-obtained'
                                className='input-obtained'
                                {...inputPropMap.obtained}
                            />
                            <TextInput
                                label='Obtained Link'
                                id='input-obtained-link'
                                className='input-obtained-link'
                                {...inputPropMap.obtainedLink}
                            />
                            <TextInput
                                label='Pokeball'
                                id='input-pokeball'
                                className='input-pokeball'
                                {...inputPropMap.pokeball}
                            />
                            <TextInput
                                label='Pokeball Link'
                                id='input-pokeball-link'
                                className='input-pokeball-link'
                                {...inputPropMap.pokeballLink}
                            />
                            <TextInput
                                label='Held Item'
                                id='input-held-item'
                                className='input-held-item'
                                {...inputPropMap.heldItem}
                            />
                            <TextInput
                                label='Held Item Link'
                                id='input-held-item-link'
                                className='input-held-item-link'
                                {...inputPropMap.heldItemLink}
                            />
                            <Textarea
                                label='Boutique Mods'
                                id='input-boutique-mods'
                                className='input-boutique-mods'
                                minRows={1}
                                maxRows={3}
                                autosize
                                {...inputPropMap.boutiqueMods}
                            />
                            <TextInput
                                label='Boutique Mods Link'
                                id='input-boutique-mods-link'
                                className='input-boutique-mods-link'
                                {...inputPropMap.boutiqueModsLink}
                            />
                        </Box>}
                </EntityEditor>
            }
            <BBCodeFromTemplate
                entityObjectClassName="Pokemon"
                entityObject={selected ?? {}}
                bbCodeAreaProps={{
                    label: `Pokemon ${selected?.name || ''}`
                }}
            />
        </Stack>
    </>;
};

export default Pokemon;