import {
  ChangeLogBase,
  ItemLog,
  Pokemon,
  UrlNote,
  WalletLog,
} from "~/orm/entities";
import { useDebouncedRepoSave, useRepository } from "~/services";
import {
  DeepPartial,
  EntityTarget,
  FindManyOptions,
  Repository,
} from "typeorm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAsyncEffect } from "use-async-effect";
import {
  Box,
  Button,
  createStyles,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  DataTable,
  DataTableCallbacks,
  PropConfig,
} from "~/components/dataTable/dataTable";
import {
  createNumberPropConfig,
  createSelectPropConfig,
  createStringPropConfig,
} from "~/components/dataTable/configCreators";
import { CurrencyTypeSelectItems } from "~/orm/enums";
import { EntityEditor } from "~/components";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { PokemonChangeDataTable } from "~/pageComponents/post-summaries/PokemonChangeDataTable";
import { AddIcon } from "~/appIcons";
import { css } from "@emotion/react";
import { useListState, UseListStateHandlers } from "@mantine/hooks";
import { IconPencilPlus } from "@tabler/icons";
import { debounce } from "~/util";

interface PostSummaryProps {
  urlNote: UrlNote;
  openCreateModal?: () => void;
  onUpdate?: (newValue: UrlNote) => void;
  onDelete?: (deletedValue: UrlNote) => void;
}

const useDataTableStyles = createStyles({
  quantityChange: {
    width: "10em",
  },
  currencyType: {
    width: "20%",
  },
  itemDefinition: {
    width: "20%",
  },
  note: {
    width: "60%",
  },
});

function useRelevantLogs<T extends ChangeLogBase>(
  repoTarget: EntityTarget<T>,
  urlNote: UrlNote,
  relations?: FindManyOptions["relations"]
): [T[], Repository<T> | null] {
  const [entities, setEntities] = useState<T[]>([]);
  const repo = useRepository(repoTarget);

  useAsyncEffect(async () => {
    if (!repo) return;
    setEntities(
      await repo.find({ where: { sourceUrl: urlNote.url } as any, relations })
    );
  }, [urlNote.id, repo]);

  return [entities, repo];
}

function useRelevantPokemon(
  urlNote: UrlNote
): [Pokemon[], Repository<Pokemon> | null] {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const repo = useRepository(Pokemon);

  useAsyncEffect(async () => {
    if (!repo) return;
    const url = urlNote.url;
    setPokemonList(
      await repo.findBy([
        { obtainedLink: url },
        { levelLogs: { sourceUrl: url } },
        { bondLogs: { sourceUrl: url } },
        { pokeballLink: url },
        { heldItemLink: url },
        { evolutionStageTwoMethodLink: url },
        { evolutionStageThreeMethodLink: url },
        { eggMoveLogs: { sourceUrl: url } },
        { tutorMoveLogs: { sourceUrl: url } },
        { machineMoveLogs: { sourceUrl: url } },
        { boutiqueModsLink: url },
        { otherMoveLogs: { sourceUrl: url } },
        { contestStatsLogs: { sourceUrl: url } },
      ])
    );
  }, [repo, urlNote.id]);

  return [pokemonList, repo];
}

export function PostSummary({
  urlNote,
  openCreateModal,
  onUpdate,
  onDelete,
}: PostSummaryProps) {
  const urlNoteRepo = useRepository(UrlNote);

  const dataTableStyles = useDataTableStyles();

  const [dbWalletLogs, walletRepo] = useRelevantLogs(WalletLog, urlNote);
  const [walletLogs, walletLogsHandler] = useListState<WalletLog>([]);
  useEffect(() => walletLogsHandler.setState(dbWalletLogs), [dbWalletLogs]);
  const saveWalletLogs = useDebouncedRepoSave(walletRepo);

  const [dbItemLogs, itemRepo] = useRelevantLogs(ItemLog, urlNote, {
    itemDefinition: true,
  });
  const [itemLogs, itemLogsHandler] = useListState<ItemLog>([]);
  useEffect(() => itemLogsHandler.setState(dbItemLogs), [dbItemLogs]);
  const saveItemLogs = useDebouncedRepoSave(itemRepo);

  const [initialPokemonList, pokemonRepo] = useRelevantPokemon(urlNote);
  const [pokemonList, pokemonListHandler] = useListState<Pokemon>([]);
  useEffect(
    () => pokemonListHandler.setState(initialPokemonList),
    [initialPokemonList]
  );

  const [dateValue, setDateValue] = useState<dayjs.Dayjs | null>(null);

  const { id, label, url, date } = urlNote;
  const infoRef = useRef({ ...urlNote });
  const {
    id: lastId,
    label: lastLabel,
    url: lastUrl,
    date: lastDate,
  } = infoRef.current;
  const oldInfoRef = useRef({ ...infoRef.current });
  infoRef.current = { ...urlNote };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applyNewInfoToLogs = useCallback(
    debounce((label: string | null, url: string, date: dayjs.Dayjs | null) => {
      function innerApply<T extends ItemLog | WalletLog>(log: T): T {
        if (
          !log.sourceNote?.trim() ||
          log.sourceNote.trim() === oldInfoRef.current.label?.trim()
        ) {
          log.sourceNote = label?.trim() ?? null;
        }
        if (
          !log.sourceUrl?.trim() ||
          log.sourceUrl.trim() === oldInfoRef.current.url.trim()
        ) {
          log.sourceUrl = url.trim();
        }
        if (
          !log.date ||
          log.date?.valueOf() === oldInfoRef.current.date?.valueOf()
        ) {
          log.date = date ?? dayjs().utc(false);
        }
        return { ...log };
      }

      walletLogsHandler.setState((prevState) => {
        const newState = prevState.map((log) => innerApply(log));
        saveWalletLogs(newState);
        return newState;
      });
      setTimeout(() => {
        itemLogsHandler.setState((prevState) => {
          const newState = prevState.map((log) => innerApply(log));
          saveItemLogs(newState);
          return newState;
        });

        oldInfoRef.current.label = label;
        oldInfoRef.current.url = url;
        oldInfoRef.current.date = date;
      }, 0);
    }),
    [id]
  );

  if (id === lastId) {
    if (lastLabel !== label || lastUrl !== url || lastDate !== date) {
      applyNewInfoToLogs(label, url, date);
    }
  }

  const dateVal = date?.valueOf() ?? null;
  useEffect(() => {
    setDateValue(date);
  }, [dateVal]);

  const makeLogCallbacks = useCallback(
    <T extends WalletLog | ItemLog>(
      repo: Repository<T> | null,
      logsHandler: UseListStateHandlers<T>
    ): DataTableCallbacks<T> => ({
      async add() {
        if (!repo) return;
        const { label, url, date } = infoRef.current;
        let newLog = repo.create({
          sourceNote: label,
          sourceUrl: url,
          date: date,
        } as DeepPartial<T>);
        newLog = await repo.save(newLog);
        logsHandler.append(newLog);
      },
      async edit(log, key, value) {
        if (!repo) return;
        log[key] = value;
        log = await repo.save(log);
        logsHandler.setState((prev) =>
          prev.map((l) => (l.id === log.id ? log : l))
        );
      },
      async remove(log) {
        if (!repo) return;
        logsHandler.filter((l) => l.id !== log.id);
        await repo.remove(log);
      },
    }),
    []
  );

  const itemLogCallbacks = useMemo(
    () => makeLogCallbacks(itemRepo, itemLogsHandler),
    [makeLogCallbacks, itemRepo]
  );

  const walletLogCallbacks = useMemo(
    () => makeLogCallbacks(walletRepo, walletLogsHandler),
    [makeLogCallbacks, walletRepo]
  );

  if (!urlNoteRepo) {
    return <>Loading...</>;
  }

  const deleteAllowed =
    dbWalletLogs.length + dbItemLogs.length + initialPokemonList.length === 0;

  return (
    <Stack>
      <Divider size="xl" />
      <LoadingOverlay
        visible={(dbWalletLogs || dbItemLogs || initialPokemonList) === null}
      />
      <EntityEditor
        targetEntity={urlNote}
        entityRepo={urlNoteRepo}
        entityLabel={"Post Summary"}
        createNewEntity={() => {
          openCreateModal?.();
          return null;
        }}
        onUpdate={(entities) => onUpdate?.(entities[0])}
        onConfirmedDelete={(entity) => onDelete?.(entity)}
        allowDelete={deleteAllowed}
        extraHeaderElement={
          deleteAllowed ? undefined : (
            <Text
              sx={{
                flex: "1 1 50%",
                lineHeight: 1.25,
                whiteSpace: "break-spaces",
              }}
              align="right"
              italic
            >
              Cannot&nbsp;delete&nbsp;while
              <wbr />
              &nbsp;changes&nbsp;are&nbsp;recorded
            </Text>
          )
        }
      >
        {(inputPropMap) => (
          <>
            <Group>
              <DatePicker
                sx={{ width: "7em" }}
                label="Date"
                clearable={false}
                inputFormat="DD-MMM-YYYY"
                firstDayOfWeek="sunday"
                value={dateValue?.toDate()}
                onChange={(date) => {
                  const dayjsVal = date ? dayjs(date).utc(false) : null;
                  setDateValue(dayjsVal);
                  inputPropMap.date.onChange(dayjsVal);
                }}
                styles={{
                  input: { textAlign: "center" },
                }}
              />
              <TextInput
                sx={{ flexGrow: 1 }}
                label="Label"
                {...inputPropMap.label}
              />
            </Group>
            <TextInput label="URL" {...inputPropMap.url} />
            <Textarea
              label="Post Text / Misc Notes"
              {...inputPropMap.postText}
            />
          </>
        )}
      </EntityEditor>
      <Title order={2}>Wallet Changes</Title>
      {walletLogs.length > 0 ? (
        <Paper withBorder>
          <ScrollArea
            type="auto"
            styles={{
              scrollbar: { zIndex: 10 },
            }}
          >
            <div
              css={css`
                min-width: 500px;
              `}
            >
              <DataTable
                isEditMode={true}
                rowsPerPage={Math.min(walletLogs.length, 5)}
                rowObjs={walletLogs}
                rowObjToId={(wl) => wl.id}
                propConfig={walletLogPropConfig}
                propsToMantineClasses={dataTableStyles.classes}
                {...walletLogCallbacks}
              />
            </div>
          </ScrollArea>
        </Paper>
      ) : (
        <Box>
          <Button px="sm" color="green" onClick={walletLogCallbacks.add}>
            <Group spacing="xs">
              <AddIcon />
              <Text>Record Wallet Change</Text>
            </Group>
          </Button>
        </Box>
      )}
      <Title order={2}>Item Changes</Title>
      {itemLogs.length > 0 ? (
        <Paper withBorder>
          <ScrollArea
            type="auto"
            styles={{
              scrollbar: { zIndex: 10 },
            }}
          >
            <div
              css={css`
                min-width: 500px;
              `}
            >
              <DataTable
                isEditMode={true}
                rowsPerPage={Math.min(itemLogs.length, 5)}
                rowObjs={itemLogs}
                rowObjToId={(il) => il.id}
                propConfig={itemLogPropConfig}
                propsToMantineClasses={dataTableStyles.classes}
                {...itemLogCallbacks}
              />
            </div>
          </ScrollArea>
        </Paper>
      ) : (
        <Box>
          <Button px="sm" color="green" onClick={itemLogCallbacks.add}>
            <Group spacing="xs">
              <AddIcon />
              <Text>Record Item Change</Text>
            </Group>
          </Button>
        </Box>
      )}
      <Title order={2}>Pokemon Changes</Title>
      <Flex gap="xl">
        <Button px="xs" color="indigo">
          <Group spacing="xs">
            <IconPencilPlus />
            Record Changes to Existing Pokemon
          </Group>
        </Button>
        <Button px="xs" color="green">
          <Group spacing="xs">
            <AddIcon />
            Record New Pokemon
          </Group>
        </Button>
      </Flex>
      {pokemonList.map((p) => (
        <Paper
          id={p.uuid + "_changeData"}
          key={p.uuid + "_changeDataContainer"}
          withBorder
        >
          <PokemonChangeDataTable
            key={p.uuid + "_changeDataTable"}
            pokemon={p}
            url={urlNote!.url}
            urlLabel={urlNote!.label ?? ""}
            date={urlNote!.date}
          />
        </Paper>
      ))}
    </Stack>
  );
}

const walletLogPropConfig: PropConfig<WalletLog> = {
  quantityChange: createNumberPropConfig("quantityChange", "Change"),
  currencyType: createSelectPropConfig(
    CurrencyTypeSelectItems,
    "currencyType",
    "Currency Type"
  ),
  sourceNote: createStringPropConfig("sourceNote", "Note"),
};

const itemLogPropConfig: PropConfig<ItemLog> = {
  quantityChange: createNumberPropConfig("quantityChange", "Change"),
  itemDefinition: {
    headerLabel: "Item",
    viewComponent: (value) => <Text>{value?.name ?? "Missing Item Def"}</Text>,
    editorComponent: (value) => (
      <Text>{value?.name ?? "Missing Item Def"}</Text>
    ),
  },
  sourceNote: createStringPropConfig("sourceNote", "Note"),
};
