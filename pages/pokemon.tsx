import {
  Box,
  Button,
  createStyles,
  Divider,
  Group,
  Select,
  SelectItem,
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
import { useAsyncEffect } from "use-async-effect";
import {
  BondLog,
  ContestStatLog,
  EggMoveLog,
  LevelLog,
  LevelUpMove,
  MachineMoveLog,
  MoveLog,
  OtherMoveLog,
  Pokemon,
  PokemonSpecialStatus,
  Trainer,
  TutorMoveLog,
} from "~/orm/entities";
import { BBCodeArea, EditModeToggle, EntityEditor } from "~/components";
import { AddIcon, PokeDexIcon } from "~/appIcons";
import {
  PokemonContestStat,
  PokemonGenderOptions,
  PokemonMoveSourceCategory,
} from "~/orm/enums";
import {
  InputDataTableModal,
  InputDataTableModalProps,
} from "~/components/input/InputDataTableModal";
import {
  createNumberPropConfig,
  createSelectPropConfig,
  createStringPropConfig,
  createUrlPropConfig,
} from "~/components/dataTable/configCreators";
import { PropConfig } from "~/components/dataTable/dataTable";
import { currentTime } from "~/util";
import { usePokemonBBCodeTemplate } from "~/usePokemonBBCodeTemplate";
import { CombinedPokemonOutput } from "~/pageComponents/pokemon/CombinedPokemonOutput";
import { useListState } from "@mantine/hooks";
import { AccordionSpoiler } from "~/components/AccordionSpoiler";
import { MovesTextStack } from "~/pageComponents/pokemon/MovesTextStack";
import { LevelUpMovesDisplay } from "~/pageComponents/pokemon/LevelUpMovesDisplay";
import { ContestStatsDisplay } from "~/pageComponents/pokemon/ContestStatsDisplay";

const useEditorStyle = createStyles((theme) => ({
  editor: {
    display: "grid",
    gap: "0.5em",
    [theme.fn.largerThan("md")]: {
      gridTemplateAreas: `nme spe dex lvl bnd
                          typ abl obt pkb hld
                          nat gen obl pkl hll
                          trn sst sub sub img
                          des des des des des
                          ev1 e2m ev2 e3m ev3
                          .   e2l .   e3l .
                          bqm bqm bqm bql bql
                          con con con con con
                          lmv emv mmv tmv omv`
        .split("\n")
        .map((l) => `"${l.trim()}"`)
        .join(""),
      gridTemplateColumns: "repeat(5, 1fr)",
    },
    [theme.fn.smallerThan("md")]: {
      gridTemplateAreas: `nme lvl bnd
                          spe dex typ
                          abl nat gen
                          obt pkb hld
                          obl pkl hll
                          trn sst img
                          sub sub   .
                          des des des
                          ev1 ev2 ev3
                          .   e2m e3m
                          .   e2l e3l
                          bqm bqm bql
                          con con con
                          lmv emv mmv
                          lmv tmv omv`
        .split("\n")
        .map((l) => `"${l.trim()}"`)
        .join(""),
      gridTemplateColumns: "repeat(3, 1fr)",
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
    ".input-sub": { gridArea: "sub" },
    ".input-special-statuses": { gridArea: "sst" },
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

const genderOptions: SelectItem[] = [
  { label: "\xa0", value: PokemonGenderOptions.UNDECIDED },
  { label: "Genderless", value: PokemonGenderOptions.GENDERLESS },
  { label: "Male", value: PokemonGenderOptions.MALE },
  { label: "Female", value: PokemonGenderOptions.FEMALE },
];

const PokemonPage: NextPage = () => {
  const [repo, trainerRepo] = useRepositories(Pokemon, Trainer) as [
    Repository<Pokemon> | undefined,
    Repository<Trainer> | undefined
  ];
  const [entityList, entityListHandler] = useListState<Pokemon>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon>();

  const [trainerList, setTrainerList] = useState<Trainer[]>();

  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitForTransactions(repo);
    const list = await repo.find({
      loadEagerRelations: true,
    });
    entityListHandler.setState(list);
    setSelectedPokemon(selectedPokemon ?? list[0] ?? undefined);
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
      levelLogs: [],
      bondLogs: [],
      levelUpMoves: [],
      eggMoveLogs: [],
      machineMoveLogs: [],
      tutorMoveLogs: [],
      otherMoveLogs: [],
      contestStatsLogs: [],
      specialStatuses: [],
    }) as Pokemon;
  }, [repo]);

  const editorStyle = useEditorStyle();

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
          if (!selectedPokemon) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selectedPokemon;
          });
          return logs;
        },
        propConfig: {
          value: createNumberPropConfig("value", "Level", 0),
        } as PropConfig<LevelLog>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selectedPokemon]
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
          if (!selectedPokemon) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selectedPokemon;
          });
          return logs;
        },
        propConfig: {
          value: createNumberPropConfig("value", "Bond Change", 0),
        } as PropConfig<BondLog>,
        propsToMantineClasses: modalTableStyles.classes,
      }),
      [modalTableStyles.classes, selectedPokemon]
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
          if (!selectedPokemon) return;
          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selectedPokemon;
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
      [modalTableStyles.classes, selectedPokemon]
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
          if (!selectedPokemon) return;
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
        allowRowReordering: true,
      }),
      [modalTableStyles.classes, selectedPokemon]
    );

  const makeMoveModalProps = useCallback(
    function <T extends MoveLog>(moveClass: {
      new (): T;
    }): InputDataTableModalProps<T>["modalProps"] {
      return {
        dataTableType: "changeLog",
        rowObjToId: (log: T) => log.id,
        createRowObj: (rowsObjsCount) => {
          const newMove = new moveClass();
          newMove.id = -(rowsObjsCount + 1);
          return newMove;
        },
        prepareForSaveCallback: async (logs: T[]) => {
          if (!selectedPokemon) return;

          logs.forEach((l) => {
            (l.id as any) = l.id > 0 ? l.id : undefined;
            l.pokemon = selectedPokemon;
          });

          return logs;
        },
        propConfig: {
          move: createStringPropConfig("move", "Move", 0),
        } as PropConfig<T>,
        propsToMantineClasses: modalTableStyles.classes,
        allowRowReordering: true,
      };
    },
    [modalTableStyles.classes, selectedPokemon]
  );

  const moveModalProps = useMemo(
    () => ({
      [PokemonMoveSourceCategory.EGG]: makeMoveModalProps(EggMoveLog),
      [PokemonMoveSourceCategory.MACHINE]: makeMoveModalProps(MachineMoveLog),
      [PokemonMoveSourceCategory.TUTOR]: makeMoveModalProps(TutorMoveLog),
      [PokemonMoveSourceCategory.OTHER]: makeMoveModalProps(OtherMoveLog),
    }),
    [makeMoveModalProps]
  );

  const specialStatusesProps: InputDataTableModalProps<PokemonSpecialStatus>["modalProps"] =
    useMemo(
      () => ({
        dataTableType: "normal",
        rowObjToId: (status) => (status as any).tempId ?? status.status,
        createRowObj: (rowsObjsCount) => {
          const newStatus = new PokemonSpecialStatus();
          (newStatus as any).tempId = rowsObjsCount;
          return newStatus;
        },
        prepareForSaveCallback: async (logs: PokemonSpecialStatus[]) => {
          if (!selectedPokemon) return;
          return logs;
        },
        propConfig: {
          status: createStringPropConfig("status", "Status", 0),
          statusLink: createUrlPropConfig("statusLink", "Link", 1),
          statusColor: createStringPropConfig("statusColor", "Color", 2),
        } as PropConfig<PokemonSpecialStatus>,
        propsToMantineClasses: modalTableStyles.classes,
        allowRowReordering: true,
      }),
      [modalTableStyles.classes, selectedPokemon]
    );

  const applyBBCodeTemplate = usePokemonBBCodeTemplate();

  const [genderState, setGenderState] = useState<PokemonGenderOptions>(
    PokemonGenderOptions.UNDECIDED
  );
  const [trainerIdState, setTrainerIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPokemon) return;
    setGenderState(selectedPokemon.gender);
    setTrainerIdState(selectedPokemon.trainerId);
  }, [selectedPokemon]);

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
            value={selectedPokemon?.uuid ?? "Loading..."}
            onChange={(uuid) =>
              setSelectedPokemon(entityList.find((t) => t.uuid === uuid))
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
          selectedPokemon?.name || selectedPokemon?.species || "A Pokemon"
        }'s Profile`}</Title>
        {!!selectedPokemon ? (
          <></>
        ) : (
          <Button
            color="green"
            leftIcon={<AddIcon />}
            onClick={async () => {
              await waitForTransactions(repo);
              const pokemon = await repo!.save(createNewPokemon());
              entityListHandler.append(pokemon);
              setSelectedPokemon(pokemon);
              setEditModeOn(true);
            }}
          >
            <Title order={5}>Create a Pokemon to get started!</Title>
          </Button>
        )}
        {!editModeOn || !selectedPokemon || !repo ? (
          <></>
        ) : (
          <EntityEditor
            entityId={selectedPokemon.uuid}
            targetEntity={selectedPokemon}
            entityRepo={repo}
            confirmDeletePlaceholder={`${
              selectedPokemon.name || selectedPokemon.species || "(New Pokemon)"
            } has fainted!`}
            createNewEntity={createNewPokemon}
            onAdd={(pokemon: Pokemon) => {
              entityListHandler.append(pokemon);
              setSelectedPokemon(pokemon);
            }}
            onUpdate={(updatedPokemon: Pokemon[]) => {
              for (const pokemon of updatedPokemon) {
                const index = entityList.findIndex(
                  (t) => t.uuid === pokemon.uuid
                );
                if (pokemon.uuid === selectedPokemon?.uuid) {
                  setSelectedPokemon(pokemon);
                }
                entityListHandler.setItem(index, pokemon);
              }
            }}
            onConfirmedDelete={(pokemon: Pokemon) => {
              const index = entityList.findIndex(
                (p) => p.uuid === pokemon.uuid
              );
              entityListHandler.filter((p) => p.uuid !== pokemon.uuid);
              setSelectedPokemon(
                entityList.length - 1 === 0
                  ? undefined
                  : entityList[Math.max(0, index - 1)]
              );
            }}
            extraHeaderElement={
              <Button color="blue" leftIcon={<PokeDexIcon />}>
                {`Import from FizzyDex`}
              </Button>
            }
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
                  sortFunction={(a, b) => a.value - b.value}
                  {...inputPropMap.levelLogs}
                  modalProps={levelModalProps}
                />
                <InputDataTableModal
                  label="Bond"
                  id="input-bond"
                  className="input-bond"
                  modalTitle={<Title>Edit Bond Logs</Title>}
                  valueToDisplayElement={(logs: BondLog[]) =>
                    logs.reduce(
                      (prev, curr) => Math.min(30, prev + curr.value),
                      0
                    )
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
                  value={genderState}
                  onChange={(value) => {
                    if (value) {
                      setGenderState(value as PokemonGenderOptions);
                    }
                    inputPropMap.gender.onChange(value);
                  }}
                />
                <Select
                  data={trainerOpts}
                  label="Owning Trainer"
                  id="input-trainer"
                  className="input-trainer"
                  value={trainerIdState}
                  onChange={(value) => {
                    setTrainerIdState(value);
                    inputPropMap.trainerId.onChange(value);
                  }}
                />
                <TextInput
                  label="Image Link"
                  id="input-image-link"
                  className="input-image-link"
                  placeholder="https://www.serebii.net/art/th/(dex number here).png"
                  {...inputPropMap.imageLink}
                />
                <Textarea
                  label="Description"
                  id="input-description"
                  className="input-description"
                  autosize={true}
                  minRows={3}
                  maxRows={6}
                  styles={{
                    input: {
                      resize: "vertical",
                    },
                  }}
                  {...inputPropMap.description}
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
                  {...inputPropMap.evolutionStageThreeMethodLink}
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
                    <ContestStatsDisplay pokemon={selectedPokemon!} />
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
                    <LevelUpMovesDisplay pokemon={selectedPokemon!} />
                  )}
                  {...inputPropMap.levelUpMoves}
                  modalProps={levelMoveModalProps}
                />
                <InputDataTableModal
                  label="Egg Moves"
                  id="input-egg-moves"
                  className="input-egg-moves"
                  modalTitle={<Title>Edit Egg Moves</Title>}
                  valueToDisplayElement={(moves) => (
                    <MovesTextStack moves={moves} />
                  )}
                  {...inputPropMap.eggMoveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.EGG]}
                />
                <InputDataTableModal
                  label="Machine Moves"
                  id="input-machine-moves"
                  className="input-machine-moves"
                  modalTitle={<Title>Edit Machine Moves</Title>}
                  valueToDisplayElement={(moves) => (
                    <MovesTextStack moves={moves} />
                  )}
                  {...inputPropMap.machineMoveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.MACHINE]}
                />
                <InputDataTableModal
                  label="Tutor Moves"
                  id="input-tutor-moves"
                  className="input-tutor-moves"
                  modalTitle={<Title>Edit Tutor Moves</Title>}
                  valueToDisplayElement={(moves) => (
                    <MovesTextStack moves={moves} />
                  )}
                  {...inputPropMap.tutorMoveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.TUTOR]}
                />
                <InputDataTableModal
                  label="Other Moves"
                  id="input-other-moves"
                  className="input-other-moves"
                  modalTitle={<Title>Edit Other Moves</Title>}
                  valueToDisplayElement={(moves) => (
                    <MovesTextStack moves={moves} />
                  )}
                  {...inputPropMap.otherMoveLogs}
                  modalProps={moveModalProps[PokemonMoveSourceCategory.OTHER]}
                />
                <TextInput
                  label="Sub Heading"
                  id="input-sub"
                  className="input-sub"
                  {...inputPropMap.subHeading}
                />
                <InputDataTableModal
                  label="Special Statuses"
                  id="input-special-statuses"
                  className="input-special-statuses"
                  modalTitle={<Title>Edit Special Statuses</Title>}
                  valueToDisplayElement={(value: PokemonSpecialStatus[]) =>
                    value?.length > 0 ? (
                      <Text>{value.map((v) => v.status).join(" / ")}</Text>
                    ) : (
                      <Text color="dimmed">Ex: Shiny, Shadow, GMax Factor</Text>
                    )
                  }
                  {...inputPropMap.specialStatuses}
                  modalProps={specialStatusesProps}
                />
              </Box>
            )}
          </EntityEditor>
        )}
        {selectedPokemon && (
          <BBCodeArea
            label={`Pokemon ${selectedPokemon?.name || ""}`}
            bbCode={applyBBCodeTemplate(selectedPokemon)}
          />
        )}
        <AccordionSpoiler
          label={<Title order={3}>Combined Pokemon Output</Title>}
        >
          {entityList && trainerList && (
            <CombinedPokemonOutput
              pokemonList={entityList}
              trainerOptions={trainerList}
            />
          )}
        </AccordionSpoiler>
      </Stack>
    </>
  );
};

export default PokemonPage;
