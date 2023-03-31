import { ChangeLogBase, Pokemon } from "~/orm/entities";
import React, { useEffect, useMemo, useRef } from "react";
import { useListState } from "@mantine/hooks";
import {
  ChangeOptionPropsMap,
  PokemonChangeLog,
  PokemonChangeOption,
} from "~/page-components/post-summaries/PokemonChangeLog";
import {
  Box,
  createStyles,
  Group,
  Image,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconQuestionCircle } from "@tabler/icons";
import {
  DataTable,
  DataTableCallbacks,
  PropConfigEntry,
} from "~/components/dataTable/dataTable";
import { PokemonContestStat } from "~/orm/enums";
import { toHeaderCase } from "js-convert-case";
import { css } from "@emotion/react";
import { OpenAddPokemonChangeModal } from "~/page-components/post-summaries/AddPokemonChangeOptionModal";
import { useDebouncedRepoSave, useRepository } from "~/services";
import { LocalDate } from "@js-joda/core";

const useDataTableStyles = createStyles<
  keyof Pick<
    PokemonChangeLog,
    "changeOption" | "dataValue" | "noteValue" | "contestStat"
  >,
  { hasContestStat: boolean }
>((theme, params) => ({
  changeOption: {
    width: "8em",
  },
  dataValue: {},
  noteValue: {},
  contestStat: {
    width: !params.hasContestStat ? "0" : "9em",
  },
}));

export interface PokemonChangeDataTableProps {
  pokemon: Pokemon;
  isEditMode: boolean;
  url: string;
  urlLabel: string;
  date: LocalDate | null;
  onNoLogs: () => void;
}

export function PokemonChangeDataTable({
  pokemon,
  isEditMode,
  url,
  urlLabel,
  date,
  onNoLogs,
}: PokemonChangeDataTableProps): JSX.Element {
  const pokemonRepo = useRepository(Pokemon);
  const [changeLogs, changeLogsHandler] = useListState<PokemonChangeLog>([]);
  const infoRef = useRef({ url, urlLabel, date });
  const pokemonRef = useRef<Pokemon>(pokemon);

  // If URL or date change, then push changes into change log list
  if (
    url !== infoRef.current.url ||
    urlLabel !== infoRef.current.urlLabel ||
    date?.valueOf() !== infoRef.current.date?.valueOf()
  ) {
    infoRef.current = { url, urlLabel, date };
    changeLogsHandler.apply((log) => log.updateInfo(url, date, urlLabel));
  }

  // If pokemon changes, throw everything out
  useEffect(() => {
    changeLogsHandler.setState(generateLogs(pokemon, infoRef.current));
    pokemonRef.current = pokemon;
  }, [pokemon]);

  const debouncedPokemonSave = useDebouncedRepoSave(pokemonRepo, {
    afterSavedToRepo([updatedPokemon]) {
      pokemonRef.current = updatedPokemon;
    },
  });

  const dataTableCallbacks: DataTableCallbacks<PokemonChangeLog> = useMemo(
    () => ({
      async add() {
        OpenAddPokemonChangeModal({
          existingPokemon: pokemonRef.current,
          existingOptions: changeLogs.map((log) => log.changeOption),
          async onSelect(option) {
            const newLog = new PokemonChangeLog(
              option,
              pokemonRef.current,
              null,
              url,
              date,
              urlLabel
            );

            newLog.applyChanges(pokemonRef.current);
            pokemonRef.current = await pokemonRepo!.save(pokemonRef.current);
            if (ChangeOptionPropsMap[option].allowMultiple) {
              newLog.updateIdInArray(pokemonRef.current);
            }

            changeLogsHandler.append(newLog);
          },
        });
      },
      async edit(log, key, value) {
        if (key !== "dataValue" && key !== "noteValue" && key !== "contestStat")
          return;

        (log[key] as any) = value;
        log.applyChanges(pokemonRef.current);

        changeLogsHandler.setState((prev) =>
          prev.map((prevLog) =>
            prevLog.uuid === log.uuid
              ? Object.assign(prevLog, { [key]: value })
              : prevLog
          )
        );

        debouncedPokemonSave(pokemonRef.current);
      },
      async remove(log) {
        log.deleteChanges(pokemonRef.current);
        pokemonRef.current = await pokemonRepo!.save(pokemonRef.current);
        let newLength: number = changeLogs.length;
        changeLogsHandler.setState((prev) => {
          let newState = prev.filter((l) => l.uuid !== log.uuid);
          newLength = newState.length;
          return newState;
        });
        if (newLength === 0) {
          onNoLogs();
        }
      },
    }),
    [
      changeLogs,
      url,
      date,
      urlLabel,
      pokemonRepo,
      debouncedPokemonSave,
      onNoLogs,
    ]
  );

  const dataTableStyles = useDataTableStyles({
    hasContestStat: changeLogs.some(
      (l) => l.changeOption === PokemonChangeOption.ContestStat
    ),
  });

  if (!pokemonRepo || !pokemonRef.current) {
    return <>Loading...</>;
  }

  return (
    <ScrollArea
      type="auto"
      styles={{
        scrollbar: { zIndex: 10 },
      }}
    >
      <div
        css={css`
          min-width: 600px;
        `}
      >
        <Group
          spacing={0}
          sx={{ flexWrap: "nowrap", justifyContent: "space-between" }}
          align={"stretch"}
        >
          <Stack
            align={"center"}
            justify={"center"}
            sx={(theme) => ({
              flex: "1 0 20%",
              maxWidth: 140 + theme.spacing.xs * 2,
              borderRight: "solid 1px " + theme.colors.dark[3],
            })}
            px="xs"
          >
            <Title order={6}>{pokemon.name || pokemon.species}</Title>
            <Image
              key={`pokemon_image_${pokemon.uuid}`}
              src={pokemon.imageLink}
              alt="pokemon_image"
              withPlaceholder
              fit="scale-down"
              styles={{
                image: {
                  aspectRatio: "1/1",
                },
              }}
              placeholder={<IconQuestionCircle size={"100%"} />}
            />
          </Stack>
          <Box sx={{ flex: "0 1 100%" }}>
            <DataTable
              isEditMode={isEditMode}
              rowsPerPage={4}
              rowObjs={changeLogs}
              rowObjToId={(l) => `${l.changeOption}_${l.idInArray}`}
              propConfig={{
                changeOption: {
                  headerLabel: "Change",
                  viewComponent: (value) => <Text>{value}</Text>,
                  editorComponent: (value) => <Text>{value}</Text>,
                },
                dataValue: dataPropConfig,
                noteValue: notePropConfig,
                contestStat: contestStatPropConfig,
              }}
              {...dataTableCallbacks}
              propsToMantineClasses={dataTableStyles.classes}
            />
          </Box>
        </Group>
      </div>
    </ScrollArea>
  );
}

function generateLogs(
  pokemon: Pokemon,
  info: { url: string; urlLabel: string; date: LocalDate | null }
): PokemonChangeLog[] {
  const result: PokemonChangeLog[] = [];
  const { url, urlLabel, date } = info;

  function fromField(
    fieldUrlValue: string | null,
    changeOption: PokemonChangeOption
  ) {
    if (fieldUrlValue === url) {
      result.push(
        new PokemonChangeLog(changeOption, pokemon, null, url, date, urlLabel)
      );
    }
  }

  function fromArray(
    array: ChangeLogBase[],
    changeOption: PokemonChangeOption
  ) {
    array.forEach((value) => {
      if (value.sourceUrl === url) {
        result.push(
          new PokemonChangeLog(
            changeOption,
            pokemon,
            value.id,
            url,
            date,
            urlLabel
          )
        );
      }
    });
  }

  fromField(pokemon.obtainedLink, PokemonChangeOption.Obtained);
  fromArray(pokemon.levelLogs, PokemonChangeOption.Level);
  fromArray(pokemon.bondLogs, PokemonChangeOption.Bond);
  fromField(pokemon.pokeballLink, PokemonChangeOption.Pokeball);
  fromField(pokemon.heldItemLink, PokemonChangeOption.HeldItem);
  fromField(
    pokemon.evolutionStageTwoMethodLink,
    PokemonChangeOption.EvolutionStage2
  );
  fromField(
    pokemon.evolutionStageThreeMethodLink,
    PokemonChangeOption.EvolutionStage3
  );
  fromArray(pokemon.eggMoveLogs, PokemonChangeOption.EggMove);
  fromArray(pokemon.tutorMoveLogs, PokemonChangeOption.TutorMove);
  fromArray(pokemon.machineMoveLogs, PokemonChangeOption.MachineMove);
  fromArray(pokemon.otherMoveLogs, PokemonChangeOption.OtherMove);
  fromField(pokemon.boutiqueModsLink, PokemonChangeOption.BoutiqueVisit);
  fromArray(pokemon.contestStatsLogs, PokemonChangeOption.ContestStat);

  return result;
}

const dataPropConfig: PropConfigEntry<PokemonChangeLog, "dataValue"> = {
  order: 1,
  headerLabel: "Data",
  viewComponent(value, log) {
    const { dataLabel } = ChangeOptionPropsMap[log.changeOption];
    return (
      <span>
        <Text span weight="bold">
          {dataLabel}:{" "}
        </Text>
        <wbr />
        <Text span sx={{ whiteSpace: "nowrap" }}>
          {value}
        </Text>
      </span>
    );
  },
  editorComponent(value, onChange, log) {
    const { dataType, dataLabel } = ChangeOptionPropsMap[log.changeOption];
    if (dataType === "string") {
      return (
        <TextInput
          label={dataLabel}
          value={value ?? ""}
          onChange={async (change) =>
            await onChange(change.currentTarget.value)
          }
          styles={{
            input: {
              minHeight: "unset",
              height: "2em",
            },
          }}
        />
      );
    } else {
      return (
        <NumberInput
          label={dataLabel}
          value={(value as number) ?? 0}
          onChange={async (change) => {
            await onChange(change ?? null);
          }}
          styles={{
            input: {
              minHeight: "unset",
              height: "2em",
            },
          }}
        />
      );
    }
  },
};

const notePropConfig: PropConfigEntry<PokemonChangeLog, "noteValue"> = {
  order: 2,
  headerLabel: "Note",
  viewComponent(value, log) {
    const { noteLabel } = ChangeOptionPropsMap[log.changeOption];
    return !noteLabel ? (
      <></>
    ) : (
      <span>
        <Text span weight="bold">
          {noteLabel}:{" "}
        </Text>
        <wbr />
        <Text span>{value}</Text>
      </span>
    );
  },
  editorComponent(value, onChange, log) {
    const { noteLabel } = ChangeOptionPropsMap[log.changeOption];
    return !noteLabel ? (
      <></>
    ) : (
      <TextInput
        label={noteLabel}
        value={value ?? ""}
        onChange={async (change) => await onChange(change.currentTarget.value)}
        styles={{
          input: {
            minHeight: "unset",
            height: "2em",
          },
        }}
      />
    );
  },
};

const contestStatPropConfig: PropConfigEntry<PokemonChangeLog, "contestStat"> =
  {
    order: 2,
    headerLabel: "",
    viewComponent(value, log) {
      const { contestStatLabel } = ChangeOptionPropsMap[log.changeOption];
      return !contestStatLabel ? (
        <></>
      ) : (
        <span>
          <Text span weight="bold">
            {contestStatLabel}:{" "}
          </Text>
          <wbr />
          <Text span>{toHeaderCase(value ?? "")}</Text>
        </span>
      );
    },
    editorComponent(value, onChange, log) {
      const { contestStatLabel } = ChangeOptionPropsMap[log.changeOption];
      return !contestStatLabel ? (
        <></>
      ) : (
        <Select
          key={"select-prop-input"}
          label={contestStatLabel}
          data={[
            { label: "All", value: PokemonContestStat.ALL },
            { label: "Cute", value: PokemonContestStat.CUTE },
            { label: "Beautiful", value: PokemonContestStat.BEAUTIFUL },
            { label: "Tough", value: PokemonContestStat.TOUGH },
            { label: "Smart", value: PokemonContestStat.CLEVER },
            { label: "Cool", value: PokemonContestStat.COOL },
          ]}
          searchable
          value={(value as string) ?? ""}
          onChange={async (value) =>
            await onChange(value as PokemonContestStat | null)
          }
          styles={{
            input: {
              minHeight: "unset",
              height: "2em",
            },
          }}
        />
      );
    },
  };
