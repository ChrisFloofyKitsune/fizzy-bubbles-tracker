import {
  ChangeLogBase,
  ItemDefinition,
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
  Image,
  LoadingOverlay,
  Paper,
  Popover,
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
  createDayjsPropConfig,
  createNumberPropConfig,
  createSelectPropConfig,
  createStringPropConfig,
} from "~/components/dataTable/configCreators";
import { CurrencyTypeSelectItems } from "~/orm/enums";
import { EntityEditor } from "~/components/input";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { PokemonChangeDataTable } from "~/pageComponents/post-summaries/PokemonChangeDataTable";
import { AddIcon } from "~/appIcons";
import { css } from "@emotion/react";
import {
  useDisclosure,
  useListState,
  UseListStateHandlers,
} from "@mantine/hooks";
import { IconPencilPlus, IconQuestionCircle } from "@tabler/icons";
import { createBlankPokemon, debounce } from "~/util";
import { createItemDefinitionSelectConfig } from "~/components/dataTable/configCreators/createItemDefinitionSelectConfig";
import { TbSearch } from "react-icons/tb";
import { OpenAddPokemonChangeModal } from "~/pageComponents/post-summaries/AddPokemonChangeOptionModal";
import { PokemonChangeLog } from "~/pageComponents/post-summaries/PokemonChangeLog";
import { openContextModal } from "@mantine/modals";
import { ModalName } from "~/modalsList";
import { PokemonImportFromFizzyDexModalProps } from "~/pageComponents/pokemon/PokemonImportFromFizzyDexModal";

interface PostSummaryProps {
  urlNote: UrlNote;
  isEditMode: boolean;
  openCreateModal?: () => void;
  onUpdate?: (newValue: UrlNote) => void;
  onDelete?: (deletedValue: UrlNote) => void;
}

const useDataTableStyles = createStyles({
  quantityChange: {
    width: "8em",
  },
  currencyType: {
    width: "min-content",
  },
  itemDefinition: {
    width: "min-content",
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
  isEditMode,
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

  const itemDefRepo = useRepository(ItemDefinition);
  const [itemDefs, itemDefsHandler] = useListState<ItemDefinition>([]);
  useAsyncEffect(async () => {
    if (!itemDefRepo) return;
    itemDefsHandler.setState(await itemDefRepo.find());
  }, [itemDefRepo]);

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

  useEffect(() => {
    setDateValue(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date?.valueOf()]);

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
        if (
          key === "itemDefinition" &&
          !itemDefs.find(
            (def) =>
              def.id.toString() === (value as ItemDefinition).id.toString()
          )
        ) {
          itemDefsHandler.append(value as ItemDefinition);
        }
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
    [itemDefs]
  );

  const itemLogCallbacks = useMemo(
    () => makeLogCallbacks(itemRepo, itemLogsHandler),
    [makeLogCallbacks, itemRepo]
  );

  const walletLogCallbacks = useMemo(
    () => makeLogCallbacks(walletRepo, walletLogsHandler),
    [makeLogCallbacks, walletRepo]
  );

  const itemLogPropConfig = useMemo(
    () => makeItemLogPropConfig(itemDefs),
    [itemDefs]
  );

  ////////////////////////////////
  // POKEMON CHANGES DATA TABLE //
  ////////////////////////////////

  const [existingPokemon, existingPokemonHandler] = useListState<Pokemon>([]);
  useAsyncEffect(async () => {
    if (!pokemonRepo) return;
    existingPokemonHandler.setState(await pokemonRepo.find());
  }, [pokemonRepo]);

  const selectablePokemon = useMemo(
    () =>
      existingPokemon.filter(
        (ep) => !pokemonList.some((p) => p.uuid === ep.uuid)
      ),
    [existingPokemon, pokemonList]
  );

  const onSelectPokemon = useCallback(
    (pokemon: Pokemon) => {
      OpenAddPokemonChangeModal({
        existingPokemon: pokemon,
        async onSelect(option) {
          if (!pokemonRepo) return;
          const { url, date, label } = infoRef.current;
          const tempLog = new PokemonChangeLog(
            option,
            pokemon,
            null,
            url,
            date,
            label ?? ""
          );
          tempLog.applyChanges();
          pokemonListHandler.append(await pokemonRepo.save(pokemon));
        },
      });
    },
    [pokemonRepo]
  );

  const onRecordNewPokemon = useCallback(async () => {
    if (!pokemonRepo) return;
    openContextModal({
      modal: ModalName.PokemonImportFromFizzyDex,
      title: <Title order={2}>Record New Pokemon</Title>,
      size: "lg",
      innerProps: {
        async onImportSubmit(pokemonData) {
          if (!pokemonRepo) return;
          const newPokemon = createBlankPokemon();
          newPokemon.obtained = label;
          newPokemon.obtainedLink = url;

          newPokemon.species = pokemonData.species ?? "";
          newPokemon.dexNum = pokemonData.dexNum ?? "";
          newPokemon.type = pokemonData.type ?? "";
          newPokemon.ability = pokemonData.ability ?? "";
          newPokemon.levelUpMoves = pokemonData.levelUpMoves ?? [];

          if (pokemonData.evolutionChain) {
            newPokemon.evolutionStageOne = pokemonData.evolutionChain.stageOne;
            newPokemon.evolutionStageTwoMethod =
              pokemonData.evolutionChain.stageTwoMethod;
            newPokemon.evolutionStageTwo = pokemonData.evolutionChain.stageTwo;
            newPokemon.evolutionStageThreeMethod =
              pokemonData.evolutionChain.stageThreeMethod;
            newPokemon.evolutionStageThree =
              pokemonData.evolutionChain.stageThree;
          }

          newPokemon.imageLink = pokemonData.imageLink ?? "";

          pokemonListHandler.append(await pokemonRepo.save(newPokemon));
        },
      } as PokemonImportFromFizzyDexModalProps,
    });
  }, [label, pokemonRepo, url]);

  if (!urlNoteRepo) {
    return <>Loading...</>;
  }

  const deleteAllowed =
    walletLogs.length + itemLogs.length + pokemonList.length === 0;

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
        allowAdd={isEditMode}
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
                sx={{
                  width: "7em",
                  ".mantine-Input-disabled": {
                    border: "1px solid dimgray",
                    borderRadius: "4px",
                    color: "inherit",
                    opacity: 1,
                  },
                }}
                label="Date"
                clearable={false}
                inputFormat="DD-MMM-YYYY"
                firstDayOfWeek="sunday"
                disabled={!isEditMode}
                value={dateValue?.toDate()}
                onChange={(date) => {
                  const dayjsVal = date ? dayjs(date).utc(false) : null;
                  setDateValue(dayjsVal);
                  inputPropMap.date.onChange(dayjsVal);
                }}
                styles={{
                  input: { textAlign: "center" },
                }}
                variant={isEditMode ? "default" : "unstyled"}
              />
              <TextInput
                sx={{
                  flexGrow: 1,
                  ".mantine-Input-disabled": {
                    border: "1px solid dimgray",
                    borderRadius: "4px",
                    color: "inherit",
                    padding: "0px 12px",
                    cursor: "text",
                    opacity: 1,
                  },
                }}
                label="Label"
                disabled={!isEditMode}
                {...inputPropMap.label}
                variant={isEditMode ? "default" : "unstyled"}
              />
            </Group>
            <TextInput
              label="URL"
              disabled={!isEditMode}
              {...inputPropMap.url}
              variant={isEditMode ? "default" : "unstyled"}
              sx={{
                ".mantine-Input-disabled": {
                  border: "1px solid dimgray",
                  borderRadius: "4px",
                  color: "inherit",
                  padding: "0px 12px",
                  cursor: "text",
                  opacity: 1,
                },
              }}
            />
            <Textarea
              autosize
              minRows={3}
              maxRows={10}
              label="Post Text / Misc Notes"
              disabled={!isEditMode}
              variant={isEditMode ? "default" : "unstyled"}
              {...inputPropMap.postText}
              sx={{
                ".mantine-Input-disabled": {
                  border: "1px solid dimgray",
                  borderRadius: "4px",
                  color: "inherit",
                  padding: "10px 12px",
                  cursor: "text",
                  opacity: 1,
                },
              }}
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
                isEditMode={isEditMode}
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
          <Button
            color="green"
            leftIcon={<AddIcon />}
            onClick={walletLogCallbacks.add}
            disabled={!isEditMode}
          >
            <Text>Record Wallet Change</Text>
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
                isEditMode={isEditMode}
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
          <Button
            leftIcon={<AddIcon />}
            onClick={itemLogCallbacks.add}
            disabled={!isEditMode}
          >
            <Text>Record Item Change</Text>
          </Button>
        </Box>
      )}
      <Title order={2}>Pokemon Changes</Title>
      <Flex gap="xl" wrap={"wrap"}>
        <SelectExistingPokemonButton
          isEditMode={isEditMode}
          pokemonList={selectablePokemon}
          onSelectPokemon={onSelectPokemon}
        />
        <Button
          leftIcon={<AddIcon />}
          color="green"
          disabled={!isEditMode}
          onClick={async () => await onRecordNewPokemon()}
        >
          Record New Pokemon
        </Button>
      </Flex>
      {pokemonList.map((p, index) => (
        <Paper
          id={p.uuid + "_changeData"}
          key={p.uuid + "_changeDataContainer"}
          withBorder
        >
          <PokemonChangeDataTable
            isEditMode={isEditMode}
            key={p.uuid + "_changeDataTable"}
            pokemon={p}
            url={urlNote!.url}
            urlLabel={urlNote!.label ?? ""}
            date={urlNote!.date}
            onNoLogs={() => pokemonListHandler.remove(index)}
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
  date: createDayjsPropConfig("date", "Date"),
};

function makeItemLogPropConfig(
  availableItemDefs: ItemDefinition[]
): PropConfig<ItemLog> {
  return {
    quantityChange: createNumberPropConfig("quantityChange", "Change"),
    itemDefinition: createItemDefinitionSelectConfig(availableItemDefs, "Item"),
    sourceNote: createStringPropConfig("sourceNote", "Note"),
    date: createDayjsPropConfig("date", "Date"),
  };
}

function SelectExistingPokemonButton({
  isEditMode,
  pokemonList,
  onSelectPokemon,
}: {
  isEditMode: boolean;
  pokemonList: Pokemon[];
  onSelectPokemon?: (pokemon: Pokemon) => void;
}) {
  const [popoverOpened, { open, close }] = useDisclosure(false);
  const [filterText, setFilterText] = useState<string>();

  const filteredPokemon = useMemo(() => {
    if (!filterText?.trim()) return pokemonList;
    return pokemonList.filter((p) => {
      const name = (p.name || "(Unnamed)").toLowerCase();
      const species = (p.species || "(New Pokemon)").toLowerCase();
      const filter = filterText?.trim().toLowerCase();
      return (
        name.includes(filter) ||
        filter.includes(name) ||
        species.includes(filter) ||
        filter.includes(species)
      );
    });
  }, [pokemonList, filterText]);

  const onPokemonClick = useCallback(
    (pokemon: Pokemon) => {
      close();
      onSelectPokemon?.(pokemon);
    },
    [close, onSelectPokemon]
  );

  return (
    <Popover
      withArrow
      arrowPosition="center"
      arrowSize={18}
      shadow="md"
      position="bottom-start"
      opened={popoverOpened}
      onClose={close}
      withinPortal
    >
      <Popover.Target refProp={"ref"}>
        <Button
          leftIcon={<IconPencilPlus />}
          color="indigo"
          onClick={open}
          disabled={!isEditMode}
        >
          Record Changes to Existing Pokemon
        </Button>
      </Popover.Target>
      <Popover.Dropdown w="max(50vw, 200px)!important">
        <TextInput
          autoFocus
          placeholder={"Search"}
          value={filterText}
          onChange={(event) => setFilterText(event.currentTarget.value)}
          icon={<TbSearch />}
          pb="xs"
        />
        <ScrollArea
          h="40vh"
          offsetScrollbars
          sx={(theme) => ({
            border: "1px solid " + theme.colors.dark[4],
            borderRadius: "8px",
          })}
        >
          <Box
            p="0.25em"
            sx={{
              display: "grid",
              gap: "0.25em",
              gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
            }}
          >
            {filteredPokemon.map((p) => (
              <Button
                color="gray"
                key={`pokemon_${p.uuid}`}
                variant="filled"
                p="0.5em"
                sx={{ height: "unset" }}
                onClick={() => onPokemonClick(p)}
              >
                <Flex
                  w="100%"
                  h="100%"
                  direction="column"
                  gap="1em"
                  justify="space-between"
                >
                  <Title
                    order={6}
                    align="center"
                    sx={{ whiteSpace: "normal", lineHeight: "1.25em" }}
                  >
                    {p.name || "(Unnamed)"}
                    <br />
                    {p.species}
                  </Title>
                  <Image
                    key={`pokemon_image_${p.uuid}`}
                    src={p.imageLink}
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
                </Flex>
              </Button>
            ))}
          </Box>
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}
