// noinspection JSUnusedGlobalSymbols

import {
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  Select,
  SelectItem,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { useRepositories, waitForTransactions } from "~/services";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Repository } from "typeorm";
import useAsyncEffect from "use-async-effect";
import {
  BondLog,
  ContestStatLog,
  LevelLog,
  LevelUpMove,
  MoveLog,
  Pokemon as dbPokemon,
  Trainer,
} from "~/orm/entities";
import { BBCodeFromTemplate, EditModeToggle, EntityEditor } from "~/components";
import { AddIcon } from "~/appIcons";
import {
  PokemonContestStat,
  PokemonGenderOptions,
  PokemonMoveSourceCategory,
} from "~/orm/enums";
import {
  InputDataTableModal,
  InputDataTableModalProps,
} from "~/components/input/InputDataTableModal";
import { createNumberPropConfig } from "~/components/dataTable/configCreators/createNumberPropConfig";
import { PropConfig } from "~/components/dataTable/dataTable";
import { currentTime } from "~/util";
import { createSelectPropConfig } from "~/components/dataTable/configCreators/createEnumPropConfig";
import { createStringPropConfig } from "~/components/dataTable/configCreators/createStringPropConfig";

const useEditorStyle = createStyles((theme) => ({
  editor: {
    display: "grid",
    gap: "0.5em",
    [theme.fn.largerThan("md")]: {
      gridTemplateAreas: `nme spe dex lvl bnd
                          typ abl obt pkb hld
                          nat gen obl pkl hll
                          des des des des des
                          trn img img img img
                          ev1 e2m ev2 e3m ev3
                          .   e2l .   e3l .
                          bqm bqm bqm bql bql
                          con con con con con
                          lmv emv mmv tmv omv  `
        .split("\n")
        .map((l) => `"${l.trim()}"`)
        .join(""),
      gridTemplateColumns: "repeat(5, 1fr)",
    },
    [theme.fn.smallerThan("md")]: {
      gridTemplateAreas: `nme spe dex
                          typ abl nat
                          gen .   trn
                          obt pkb hld
                          obl pkl hll
                          des des des
                          img img img
                          ev1 ev2 ev3
                          .   e2m e3m
                          .   e2l e3l
                          bqm bqm bql`
        .split("\n")
        .map((l) => `"${l.trim()}"`)
        .join(""),
    },

    ".input-name": { gridArea: "nme" },
    ".input-species": { gridArea: "spe" },
    ".input-dexNum": { gridArea: "dex" },
    ".input-type": { gridArea: "typ" },
    ".input-level": { gridArea: "lvl" },
    ".input-bond": { gridArea: "bnd" },
    ".input-ability": { gridArea: "abl" },
    ".input-nature": { gridArea: "nat" },
    ".input-gender": { gridArea: "gen" },
    ".input-image-link": { gridArea: "img" },
    ".input-description": { gridArea: "des" },
    ".input-evo-stage-1": { gridArea: "ev1" },
    ".input-evo-stage-2-method": { gridArea: "e2m" },
    ".input-evo-stage-2-method-link": { gridArea: "e2l" },
    ".input-evo-stage-2": { gridArea: "ev2" },
    ".input-evo-stage-3-method": { gridArea: "e3m" },
    ".input-evo-stage-3-method-link": { gridArea: "e3l" },
    ".input-evo-stage-3": { gridArea: "ev3" },
    ".input-obtained": { gridArea: "obt" },
    ".input-obtained-link": { gridArea: "obl" },
    ".input-pokeball": { gridArea: "pkb" },
    ".input-pokeball-link": { gridArea: "pkl" },
    ".input-held-item": { gridArea: "hld" },
    ".input-held-item-link": { gridArea: "hll" },
    ".input-boutique-mods": { gridArea: "bqm" },
    ".input-boutique-mods-link": { gridArea: "bql" },
    ".input-trainer": { gridArea: "trn" },
    ".input-contest-stats": { gridArea: "con" },
    ".input-level-moves": { gridArea: "lmv" },
    ".input-egg-moves": { gridArea: "emv" },
    ".input-machine-moves": { gridArea: "mmv" },
    ".input-tutor-moves": { gridArea: "tmv" },
    ".input-other-moves": { gridArea: "omv" },
    "button.mantine-InputBase-input": {
      height: "min-content",
    },
  },
}));

const useModalDataTableStyles = createStyles({
  value: {
    minWidth: "5em",
    maxWidth: "8em",
  },
  stat: {
    minWidth: "5em",
    maxWidth: "8em",
  },
  statChange: {
    minWidth: "5em",
    maxWidth: "8em",
  },
  move: {
    minWidth: "6em",
    maxWidth: "10em",
  },
});

const Pokemon: NextPage = () => {
  const [repo, trainerRepo] = useRepositories(dbPokemon, Trainer) as [
    Repository<dbPokemon> | undefined,
    Repository<Trainer> | undefined
  ];
  const [entityList, setEntityList] = useState<dbPokemon[]>([]);
  const [selected, setSelected] = useState<dbPokemon>();

  const [trainerList, setTrainerList] = useState<Trainer[]>();

  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitForTransactions(repo);
    const list = await repo.find({
      loadEagerRelations: true,
    });
    setEntityList(list);
    setSelected(selected ?? list[0] ?? undefined);
  }, [repo]);

  useAsyncEffect(async () => {
    if (!trainerRepo) return;
    await waitForTransactions(trainerRepo);
    const trainers = await trainerRepo.find({
      select: {
        uuid: true,
        name: true,
      },
    });
    setTrainerList(trainers);
  }, [trainerRepo]);

  const createNewPokemon = useCallback(() => {
    return repo?.create({
      name: "",
      species: "",
      dexNum: "???",
    }) as dbPokemon;
  }, [repo]);

  const editorStyle = useEditorStyle();

  const [genderOptions, setGenderOptions] = useState<SelectItem[]>(
    [
      ["\xa0", PokemonGenderOptions.UNDECIDED],
      ["Genderless", PokemonGenderOptions.GENDERLESS],
      ["Male", PokemonGenderOptions.MALE],
      ["Female", PokemonGenderOptions.FEMALE],
    ].map(([l, v]) => ({ label: l, value: v }))
  );

  useEffect(() => {
    if (!selected) return;
    const g = selected.gender;
    if (
      g &&
      !genderOptions.some(
        ({ value }) => value.toLowerCase() === g.toLowerCase()
      )
    ) {
      setGenderOptions((current) => current.concat({ label: g, value: g }));
    }
  }, [genderOptions, selected]);

  const trainerOpts: SelectItem[] = useMemo(
    () => [
      { label: "\xa0", value: "" },
      ...(trainerList?.map((t) => ({ label: t.name, value: t.uuid })) ?? []),
    ],
    [trainerList]
  );

  const modalTableStyles = useModalDataTableStyles();

  const levelModalProps: InputDataTableModalProps<LevelLog>["modalProps"] =
    useMemo(
      () => ({
        dataTableType: "changeLog",
        rowObjToId: (log: LevelLog) => log.id,
        createRowObj: (rowsObjsCount) => {
          const newLog = new LevelLog();
          newLog.id = -(rowsObjsCount + 1);
          return newLog;
        },
        prepareForSaveCallback: async (logs: LevelLog[]) => {
          if (!selected) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selected;
          });
          return logs;
        },
        propConfig: {
          value: createNumberPropConfig("value", "Level", 0),
        } as PropConfig<LevelLog>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selected]
    );

  const bondModalProps: InputDataTableModalProps<BondLog>["modalProps"] =
    useMemo(
      () => ({
        dataTableType: "shopTrackedLog",
        rowObjToId: (log: BondLog) => log.id,
        createRowObj: (rowsObjsCount) => {
          const newLog = new BondLog();
          newLog.id = -(rowsObjsCount + 1);
          newLog.date = currentTime();
          return newLog;
        },
        prepareForSaveCallback: async (logs: BondLog[]) => {
          if (!selected) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selected;
          });
          return logs;
        },
        propConfig: {
          value: createNumberPropConfig("value", "Bond Change", 0),
        } as PropConfig<BondLog>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selected]
    );

  const contestStatsModalProps: InputDataTableModalProps<ContestStatLog>["modalProps"] =
    useMemo(
      () => ({
        dataTableType: "changeLog",
        rowObjToId: (log: ContestStatLog) => log.id,
        createRowObj: (rowsObjsCount) => {
          const newLog = new ContestStatLog();
          newLog.id = -(rowsObjsCount + 1);
          newLog.stat = PokemonContestStat.ALL;
          return newLog;
        },
        prepareForSaveCallback: async (logs: ContestStatLog[]) => {
          if (!selected) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selected;
          });
          console.log(logs);
          return logs;
        },
        propConfig: {
          stat: createSelectPropConfig(
            [
              { label: "All", value: PokemonContestStat.ALL },
              { label: "Cute", value: PokemonContestStat.CUTE },
              { label: "Beautiful", value: PokemonContestStat.BEAUTIFUL },
              { label: "Tough", value: PokemonContestStat.TOUGH },
              { label: "Smart", value: PokemonContestStat.CLEVER },
              { label: "Cool", value: PokemonContestStat.COOL },
            ],
            "stat",
            "Stat",
            0
          ),
          statChange: createNumberPropConfig("statChange", "Change", 1),
        } as PropConfig<ContestStatLog>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selected]
    );

  const levelMoveModalProps: InputDataTableModalProps<LevelUpMove>["modalProps"] =
    useMemo(
      () => ({
        dataTableType: "normal",
        rowObjToId: (move: LevelUpMove) =>
          (move as any).tempId ?? `${move.move}_${move.level}`,
        createRowObj: (rowsObjsCount) => {
          const newMove = new LevelUpMove();
          newMove.move = "";
          newMove.level = "-";
          (newMove as any).tempId = rowsObjsCount;
          return newMove;
        },
        prepareForSaveCallback: async (logs: LevelUpMove[]) => {
          if (!selected) return;
          return logs;
        },
        propConfig: {
          move: createStringPropConfig("move", "Move", 0),
          level: createSelectPropConfig(
            [
              { label: "Evolve (Learned on Evolution)", value: "evolve" },
              { label: "- (Always Learned)", value: "-" },
              ...Array.from(Array(100).keys()).map((n) => ({
                label: `Lv. ${n + 1}`,
                value: `${n + 1}`,
              })),
            ],
            "level",
            "Level",
            1
          ),
        } as PropConfig<LevelUpMove>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selected]
    );

  const makeMoveModalProps = useCallback(
    (
      moveCategory: PokemonMoveSourceCategory
    ): InputDataTableModalProps<MoveLog>["modalProps"] => ({
      dataTableType: "changeLog",
      rowObjToId: (log: MoveLog) => log.id,
      createRowObj: (rowsObjsCount) => {
        const newMove = new MoveLog();
        newMove.id = -(rowsObjsCount + 1);
        newMove.category = moveCategory;
        return newMove;
      },
      rowObjFilter: (log) => {
        console.log(log);
        return true;
      },
      prepareForSaveCallback: async (logs: MoveLog[]) => {
        console.log(logs);
        if (!selected) return;

        logs.forEach((l) => {
          (l.id as any) = l.id > 0 ? l.id : undefined;
          l.pokemon = selected;
        });

        // Add back in moves of other categories to prevent them from being deleted.
        return logs.concat(
          selected.moveLogs.filter((m) => m.category !== moveCategory)
        );
      },
      propConfig: {
        move: createStringPropConfig("move", "Move", 0),
      } as PropConfig<MoveLog>,
      propsToMantineClasses: modalTableStyles.classes,
    }),
    [modalTableStyles.classes, selected]
  );

  const moveModalProps = useMemo(
    () => ({
      [PokemonMoveSourceCategory.EGG]: makeMoveModalProps(
        PokemonMoveSourceCategory.EGG
      ),
      [PokemonMoveSourceCategory.MACHINE]: makeMoveModalProps(
        PokemonMoveSourceCategory.MACHINE
      ),
      [PokemonMoveSourceCategory.TUTOR]: makeMoveModalProps(
        PokemonMoveSourceCategory.TUTOR
      ),
      [PokemonMoveSourceCategory.OTHER]: makeMoveModalProps(
        PokemonMoveSourceCategory.OTHER
      ),
    }),
    [makeMoveModalProps]
  );

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
            data={entityList.map((t) => ({
              label: `${t.name || "Unnamed"} (${t.species || "New Pokemon"})`,
              value: t.uuid,
            }))}
            value={selected?.uuid ?? "Loading..."}
            onChange={(uuid) =>
              setSelected(entityList.find((t) => t.uuid === uuid))
            }
          />
          <Title order={2} sx={{ flexGrow: 1, textAlign: "center" }}>
            Pokemon
          </Title>
          <EditModeToggle
            ml="auto"
            checked={editModeOn}
            onToggle={setEditModeOn}
          />
        </Group>
        <Divider size="lg" />
        <Title order={3} sx={{ textAlign: "center" }}>{`${
          selected?.name || selected?.species || "A Pokemon"
        }'s Profile`}</Title>
        {!!selected ? (
          <></>
        ) : (
          <Button
            color="green"
            leftIcon={<AddIcon />}
            onClick={async () => {
              await waitForTransactions(repo);
              const pokemon = await repo!.save(createNewPokemon());
              setEntityList([pokemon]);
              setSelected(pokemon);
              setEditModeOn(true);
            }}
          >
            <Title order={5}>Create a Pokemon to get started!</Title>
          </Button>
        )}
        {!editModeOn || !selected || !repo ? (
          <></>
        ) : (
          <EntityEditor
            entityId={selected.uuid}
            targetEntity={selected}
            entityRepo={repo}
            confirmDeletePlaceholder={`${
              selected.name || selected.species || "(New Pokemon)"
            } has fainted!`}
            createNewEntity={createNewPokemon}
            onAdd={(pokemon) => {
              setEntityList(entityList.concat(pokemon));
              setSelected(pokemon);
            }}
            onUpdate={(pokemon) => {
              setSelected(pokemon);
              const index = entityList.findIndex(
                (t) => t.uuid === pokemon.uuid
              );
              entityList[index] = pokemon;
              setEntityList(entityList.slice());
            }}
            onConfirmedDelete={(pokemon) => {
              const index = entityList.findIndex(
                (t) => t.uuid === pokemon.uuid
              );
              const list = entityList.filter((t) => t.uuid !== pokemon.uuid);
              setEntityList(list);
              setSelected(
                list.length === 0 ? undefined : list[Math.max(0, index - 1)]
              );
            }}
          >
            {(inputPropMap) => (
              <Box className={editorStyle.classes.editor}>
                <TextInput
                  label="Pokemon Name"
                  id="input-name"
                  className="input-name"
                  {...inputPropMap.name}
                />
                <TextInput
                  label="Species"
                  id="input-species"
                  className="input-species"
                  {...inputPropMap.species}
                />
                <TextInput
                  label="Dex No."
                  id="input-dexNum"
                  className="input-dexNum"
                  {...inputPropMap.dexNum}
                />
                <InputDataTableModal
                  label="Level"
                  id="input-level"
                  className="input-level"
                  modalTitle={<Title>Edit Level Logs</Title>}
                  valueToDisplayElement={(logs: LevelLog[]) =>
                    logs.reduce((prev, curr) => Math.max(prev, curr.value), 1)
                  }
                  {...inputPropMap.levelLogs}
                  modalProps={levelModalProps}
                />
                <InputDataTableModal
                  label="Bond"
                  id="input-bond"
                  className="input-bond"
                  modalTitle={<Title>Edit Bond Logs</Title>}
                  valueToDisplayElement={(logs: BondLog[]) =>
                    logs.reduce((prev, curr) => prev + curr.value, 0)
                  }
                  {...inputPropMap.bondLogs}
                  modalProps={bondModalProps}
                />
                <TextInput
                  label="Type"
                  id="input-type"
                  className="input-type"
                  {...inputPropMap.type}
                />
                <TextInput
                  label="Ability"
                  id="input-ability"
                  className="input-ability"
                  {...inputPropMap.ability}
                />
                <TextInput
                  label="Nature"
                  id="input-Nature"
                  className="input-nature"
                  {...inputPropMap.nature}
                />
                <Select
                  label="Gender"
                  id="input-gender"
                  className="input-gender"
                  data={genderOptions}
                  placeholder="Select or Type"
                  searchable
                  creatable
                  getCreateLabel={(query) => `${query}`}
                  onCreate={(query) => {
                    const freedomOfGenderExpression = {
                      value: query,
                      label: query,
                    };
                    setGenderOptions((current) =>
                      current.concat(freedomOfGenderExpression)
                    );
                    return freedomOfGenderExpression;
                  }}
                  {...inputPropMap.gender}
                />
                <Select
                  data={trainerOpts}
                  label="Owning Trainer"
                  id="input-trainer"
                  className="input-trainer"
                  value={selected?.trainerId ?? null}
                  onChange={inputPropMap.trainerId!.onChange}
                />
                <TextInput
                  label="Image Link"
                  id="input-image-link"
                  className="input-image-link"
                  {...inputPropMap.imageLink}
                />
                <Textarea
                  label="Description"
                  id="input-description"
                  className="input-description"
                  autosize={true}
                  minRows={3}
                  maxRows={6}
                  {...inputPropMap.bbcodeDescription}
                />
                <TextInput
                  label="Evolution Stage 1"
                  id="input-evo-stage-1"
                  className="input-evo-stage-1"
                  {...inputPropMap.evolutionStageOne}
                />
                <TextInput
                  label="Evo. Stage 2 Method"
                  id="input-evo-stage-2-method"
                  className="input-evo-stage-2-method"
                  {...inputPropMap.evolutionStageTwoMethod}
                />
                <TextInput
                  label="Evo. Stage 2 Method Link"
                  id="input-evo-stage-2-method-link"
                  className="input-evo-stage-2-method-link"
                  {...inputPropMap.evolutionStageTwoMethodLink}
                />
                <TextInput
                  label="Evolution Stage 2"
                  id="input-evo-stage-2"
                  className="input-evo-stage-2"
                  {...inputPropMap.evolutionStageTwo}
                />
                <TextInput
                  label="Evo. Stage 3 Method"
                  id="input-evo-stage-3-method"
                  className="input-evo-stage-3-method"
                  {...inputPropMap.evolutionStageThreeMethod}
                />
                <TextInput
                  label="Evo. Stage 3 Method Link"
                  id="input-evo-stage-3-method-link"
                  className="input-evo-stage-3-method-link"
                  {...inputPropMap.evolutionStageThreeMethod}
                />
                <TextInput
                  label="Evolution Stage 3"
                  id="input-evo-stage-3"
                  className="input-evo-stage-3"
                  {...inputPropMap.evolutionStageThree}
                />
                <TextInput
                  label="Obtained"
                  id="input-obtained"
                  className="input-obtained"
                  {...inputPropMap.obtained}
                />
                <TextInput
                  label="Obtained Link"
                  id="input-obtained-link"
                  className="input-obtained-link"
                  {...inputPropMap.obtainedLink}
                />
                <TextInput
                  label="Pokeball"
                  id="input-pokeball"
                  className="input-pokeball"
                  {...inputPropMap.pokeball}
                />
                <TextInput
                  label="Pokeball Link"
                  id="input-pokeball-link"
                  className="input-pokeball-link"
                  {...inputPropMap.pokeballLink}
                />
                <TextInput
                  label="Held Item"
                  id="input-held-item"
                  className="input-held-item"
                  {...inputPropMap.heldItem}
                />
                <TextInput
                  label="Held Item Link"
                  id="input-held-item-link"
                  className="input-held-item-link"
                  {...inputPropMap.heldItemLink}
                />
                <Textarea
                  label="Boutique Mods"
                  id="input-boutique-mods"
                  className="input-boutique-mods"
                  minRows={1}
                  maxRows={3}
                  autosize
                  {...inputPropMap.boutiqueMods}
                />
                <TextInput
                  label="Boutique Mods Link"
                  id="input-boutique-mods-link"
                  className="input-boutique-mods-link"
                  {...inputPropMap.boutiqueModsLink}
                />
                <InputDataTableModal
                  label="Contest Stats"
                  id="input-contest-stats"
                  className="input-contest-stats"
                  modalTitle={<Title>Edit Contest Stat Logs</Title>}
                  valueToDisplayElement={() => (
                    <ContestStatsDisplay pokemon={selected!} />
                  )}
                  {...inputPropMap.contestStatsLogs}
                  modalProps={contestStatsModalProps}
                />
                <InputDataTableModal
                  label="Level Up Moves"
                  id="input-level-moves"
                  className="input-level-moves"
                  modalTitle={<Title>Edit Level Up Moves</Title>}
                  valueToDisplayElement={() => (
                    <BBCodeMovesToTextStack
                      bbCode={selected?.levelUpMovesBBCode}
                    />
                  )}
                  {...inputPropMap.levelUpMoves}
                  modalProps={levelMoveModalProps}
                />
                <InputDataTableModal
                  label="Egg Moves"
                  id="input-egg-moves"
                  className="input-egg-moves"
                  modalTitle={<Title>Edit Egg Moves</Title>}
                  valueToDisplayElement={() => (
                    <BBCodeMovesToTextStack bbCode={selected?.eggMovesBBCode} />
                  )}
                  {...inputPropMap.moveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.EGG]}
                />
                <InputDataTableModal
                  label="Machine Moves"
                  id="input-machine-moves"
                  className="input-machine-moves"
                  modalTitle={<Title>Edit Machine Moves</Title>}
                  valueToDisplayElement={() => (
                    <BBCodeMovesToTextStack
                      bbCode={selected?.machineMovesBBCode}
                    />
                  )}
                  {...inputPropMap.moveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.MACHINE]}
                />
                <InputDataTableModal
                  label="Tutor Moves"
                  id="input-tutor-moves"
                  className="input-tutor-moves"
                  modalTitle={<Title>Edit Tutor Moves</Title>}
                  valueToDisplayElement={() => (
                    <BBCodeMovesToTextStack
                      bbCode={selected?.tutorMovesBBCode}
                    />
                  )}
                  {...inputPropMap.moveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.TUTOR]}
                />
                <InputDataTableModal
                  label="Other Moves"
                  id="input-other-moves"
                  className="input-other-moves"
                  modalTitle={<Title>Edit Other Moves</Title>}
                  valueToDisplayElement={() => (
                    <BBCodeMovesToTextStack
                      bbCode={selected?.otherMovesBBCode}
                    />
                  )}
                  {...inputPropMap.moveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.OTHER]}
                />
              </Box>
            )}
          </EntityEditor>
        )}
        {selected && (
          <BBCodeFromTemplate
            entityObjectClassName="Pokemon"
            entityObject={selected}
            bbCodeAreaProps={{
              label: `Pokemon ${selected?.name || ""}`,
            }}
          />
        )}
      </Stack>
    </>
  );
};

export default Pokemon;

type ContestStatesDisplayProps = {
  pokemon: dbPokemon | undefined;
};
function ContestStatsDisplay({ pokemon }: ContestStatesDisplayProps) {
  return (
    <SimpleGrid cols={5}>
      <Text>
        <span>
          {`Cute: `}
          {pokemon?.compileContestStat(PokemonContestStat.CUTE).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Beautiful: `}
          {pokemon?.compileContestStat(PokemonContestStat.BEAUTIFUL).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Tough: `}
          {pokemon?.compileContestStat(PokemonContestStat.TOUGH).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Smart: `}
          {pokemon?.compileContestStat(PokemonContestStat.CLEVER).total}
        </span>
      </Text>
      <Text>
        <span>
          {`Cool: `}
          {pokemon?.compileContestStat(PokemonContestStat.COOL).total}
        </span>
      </Text>
    </SimpleGrid>
  );
}

function BBCodeMovesToTextStack({ bbCode }: { bbCode: string | undefined }) {
  return (
    <Stack spacing={0}>
      {bbCode?.split(", ").map((l) => <Text key={l}>{l}</Text>) ?? ""}
    </Stack>
  );
}
