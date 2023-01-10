import { ChangeLogBase, Pokemon } from "~/orm/entities";
import dayjs from "dayjs";
import React, { useEffect, useRef } from "react";
import { useListState } from "@mantine/hooks";
import {
  ChangeOptionPropsMap,
  PokemonChangeLog,
  PokemonChangeOption,
} from "~/pageComponents/post-summaries/PokemonChangeLog";
import {
  Group,
  Stack,
  Title,
  Image,
  Text,
  Box,
  TextInput,
  NumberInput,
  Select,
  ScrollArea,
} from "@mantine/core";
import { IconQuestionCircle } from "@tabler/icons";
import { DataTable, PropConfigEntry } from "~/components/dataTable/dataTable";
import { PokemonContestStat } from "~/orm/enums";
import { toHeaderCase } from "js-convert-case";
import { css } from "@emotion/react";
import { decodeHTML } from "entities";

export interface PokemonChangeDataTableProps {
  pokemon: Pokemon;
  url: string;
  urlLabel: string;
  date: dayjs.Dayjs | null;
}

export function PokemonChangeDataTable({
  pokemon,
  url,
  urlLabel,
  date,
}: PokemonChangeDataTableProps): JSX.Element {
  const [changeLogs, changeLogsHandler] = useListState<PokemonChangeLog>([]);
  const infoRef = useRef({ url, urlLabel, date });
  // If URL or date change, then push changes into change log list
  if (
    url !== infoRef.current.url ||
    urlLabel !== infoRef.current.urlLabel ||
    date?.valueOf() !== infoRef.current.date?.valueOf()
  ) {
    infoRef.current = { url, urlLabel, date };
    console.debug(`info props are now: `, infoRef.current);
    changeLogsHandler.apply((log) => log.updateInfo(url, date, urlLabel));
  }

  // If pokemon changes, throw everything out
  useEffect(() => {
    changeLogsHandler.setState(generateLogs(pokemon, infoRef.current));
  }, [pokemon]);

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
              src={pokemon.imageLink}
              placeholder={<IconQuestionCircle />}
              alt={`${pokemon.name || pokemon.species} image`}
            />
          </Stack>
          <Box sx={{ flex: "0 1 100%" }}>
            <DataTable
              isEditMode
              rowsPerPage={4}
              rowObjs={changeLogs}
              rowObjToId={(l) => `${l.changeOption}_${l.idInArray}`}
              propConfig={{
                changeOption: {
                  headerLabel: "Change",
                  viewComponent: (value) => <Text>{decodeHTML(value)}</Text>,
                  editorComponent: (value) => <Text>{decodeHTML(value)}</Text>,
                },
                dataValue: dataPropConfig,
                noteValue: notePropConfig,
                contestStat: contestStatPropConfig,
              }}
            />
          </Box>
        </Group>
      </div>
    </ScrollArea>
  );
}

function generateLogs(
  pokemon: Pokemon,
  info: { url: string; urlLabel: string; date: dayjs.Dayjs | null }
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
  headerLabel: "",
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
        />
      );
    }
  },
};

const notePropConfig: PropConfigEntry<PokemonChangeLog, "noteValue"> = {
  order: 2,
  headerLabel: "",
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
        <Box
          key={"select-prop-edit"}
          sx={(theme) => ({
            boxShadow: "inset 0px 0px 1px 1px" + theme.colors.gray[7],
            borderRadius: "0.25em",
            height: "2em",
            padding: "0 0.25em",
          })}
        >
          <Select
            key={"select-prop-input"}
            data={[
              { label: "All", value: PokemonContestStat.ALL },
              { label: "Cute", value: PokemonContestStat.CUTE },
              { label: "Beautiful", value: PokemonContestStat.BEAUTIFUL },
              { label: "Tough", value: PokemonContestStat.TOUGH },
              { label: "Smart", value: PokemonContestStat.CLEVER },
              { label: "Cool", value: PokemonContestStat.COOL },
            ]}
            variant="unstyled"
            searchable
            sx={{
              ".mantine-Select-input": {
                height: "2em",
              },
            }}
            value={(value as string) ?? ""}
            onChange={async (value) =>
              await onChange(value as PokemonContestStat | null)
            }
          />
        </Box>
      );
    },
  };
