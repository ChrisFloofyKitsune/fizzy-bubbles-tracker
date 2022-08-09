import { ContextModalProps } from "@mantine/modals";
import { useDataSource } from "~/services";
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Badge,
  Button,
  FileInput,
  Group,
  List,
  LoadingOverlay,
  Stack,
  Switch,
  Title,
} from "@mantine/core";
import { WorkBook } from "xlsx";
import {
  extractInventory,
  extractPokemonSheet,
  extractWallet,
  fileToWorkBook,
  findPokemonSheets,
} from "~/spreadsheetFileUtil";
import { ItemDefinition, ItemLog, Pokemon, WalletLog } from "~/orm/entities";
import { CurrencyType } from "~/orm/enums";
import { useListState, UseListStateHandlers } from "@mantine/hooks";
import { CancelIcon, SaveIcon } from "~/appIcons";
import { In } from "typeorm";

interface SpreadSheetData {
  itemLogs: ItemLog[] | null;
  itemDefinitions: ItemDefinition[] | null;
  walletLogs: WalletLog[] | null;
}

interface PokemonImportOpt {
  pokemon: Pokemon;
  importing: boolean;
  overwriteWarning: boolean;
}

export type SpreadsheetImportModalProps = {};
export function SpreadsheetImportModal({
  context,
  id: modalId,
  innerProps: _,
}: ContextModalProps<SpreadsheetImportModalProps>) {
  const ds = useDataSource();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();

  const [workBook, setWorkBook] = useState<WorkBook | null>(null);

  const optItems = useImportOption("Items");
  const optPokeDollars = useImportOption("PokeDollars");
  const optWatts = useImportOption("Watts");
  const optRareCandies = useImportOption("Rare Candies");

  const [data, setData] = useState<SpreadSheetData | null>(null);
  const [pkmOpts, pkmOptsHandler] = useListState<PokemonImportOpt>([]);
  const [savingData, setSavingData] = useState<boolean>(false);

  useEffect(() => {
    if (file !== null && workBook !== null) return;

    if (file === null) {
      setWorkBook(null);
      return;
    }

    setFileError(undefined);
    fileToWorkBook(file).then(async (workBook) => {
      if (!workBook || !ds) {
        setFileError("Could not read spreadsheet from file");
      } else {
        const inventory = extractInventory(workBook);
        const walletLogs = extractWallet(workBook);
        const pokemon = findPokemonSheets(workBook)
          .map((s) => extractPokemonSheet(workBook, s))
          .filter((pkm) => !!pkm) as Pokemon[];

        setData({
          itemLogs: inventory?.logs || null,
          itemDefinitions: inventory?.definitions || null,
          walletLogs: walletLogs || null,
        });

        const itemLogsCount = await ds.getRepository(ItemLog).count();
        const itemDefsCount = await ds.getRepository(ItemDefinition).count();
        const itemsWarn = itemLogsCount + itemDefsCount > 0;
        optItems.setLabel(
          inventory
            ? `(${inventory.logs.length} Logs, ${inventory.definitions.length} Definitions)`
            : ""
        );
        optItems.setValue(!itemsWarn);
        optItems.setOverwriteWarning(itemsWarn);

        const walletRepo = ds.getRepository(WalletLog);

        const pdWarn =
          (await walletRepo.countBy({
            currencyType: CurrencyType.POKE_DOLLAR,
          })) > 0;
        optPokeDollars.setLabel(
          walletLogs
            ? `(${
                walletLogs.filter(
                  (l) => l.currencyType === CurrencyType.POKE_DOLLAR
                ).length
              } Logs)`
            : ""
        );
        optPokeDollars.setValue(!pdWarn);
        optPokeDollars.setOverwriteWarning(pdWarn);

        const wtWarn =
          (await walletRepo.countBy({
            currencyType: CurrencyType.WATTS,
          })) > 0;
        optWatts.setLabel(
          walletLogs
            ? `(${
                walletLogs.filter((l) => l.currencyType === CurrencyType.WATTS)
                  .length
              } Logs)`
            : ""
        );
        optWatts.setValue(!wtWarn);
        optWatts.setOverwriteWarning(wtWarn);

        const rcWarn =
          (await walletRepo.countBy({
            currencyType: CurrencyType.RARE_CANDY,
          })) > 0;
        optRareCandies.setLabel(
          walletLogs
            ? `(${
                walletLogs.filter(
                  (l) => l.currencyType === CurrencyType.RARE_CANDY
                ).length
              } Logs)`
            : ""
        );
        optRareCandies.setValue(!rcWarn);
        optRareCandies.setOverwriteWarning(rcWarn);

        const pkmRepo = ds.getRepository(Pokemon);
        const pkmOpts: PokemonImportOpt[] = [];
        for (const pkm of pokemon) {
          const existing =
            (pkm.name && (await pkmRepo.countBy({ name: pkm.name }))) !== 0;
          pkmOpts.push({
            pokemon: pkm,
            importing: !existing,
            overwriteWarning: existing,
          });
        }
        pkmOptsHandler.setState(pkmOpts);

        setWorkBook(workBook);
      }
    });
  }, [
    ds,
    file,
    optItems,
    optPokeDollars,
    optRareCandies,
    optWatts,
    pkmOptsHandler,
    workBook,
  ]);

  const saveData = useCallback(async () => {
    if (!ds) return;

    if (optItems.value && data?.itemLogs && data?.itemDefinitions) {
      const logRepo = ds.getRepository(ItemLog);
      const defRepo = ds.getRepository(ItemDefinition);
      await logRepo.clear();
      await defRepo.clear();
      await defRepo.save(data.itemDefinitions);
      await defRepo.save(data.itemLogs);
    }

    if (
      data?.walletLogs &&
      (optPokeDollars.value || optWatts.value || optRareCandies.value)
    ) {
      const typesToImport: CurrencyType[] = [];
      if (optPokeDollars.value) {
        typesToImport.push(CurrencyType.POKE_DOLLAR);
      }
      if (optWatts.value) {
        typesToImport.push(CurrencyType.WATTS);
      }
      if (optRareCandies.value) {
        typesToImport.push(CurrencyType.RARE_CANDY);
      }

      if (typesToImport.length > 0) {
        const walletRepo = ds.getRepository(WalletLog);
        await walletRepo.delete({
          currencyType: In(typesToImport),
        });
        await walletRepo.save(
          data.walletLogs.filter((l) => typesToImport.includes(l.currencyType))
        );
      }
    }

    const pkmRepo = ds.getRepository(Pokemon);
    const namesToImport = pkmOpts
      .filter((o) => !!o.pokemon.name)
      .map((o) => o.pokemon.name) as string[];
    const pokemonToRemove = await pkmRepo.findBy({ name: In(namesToImport) });
    if (pokemonToRemove.length > 0) {
      await pkmRepo.remove(pokemonToRemove);
    }
    await pkmRepo.save(
      pkmOpts
        .filter(
          (o) => !o.pokemon.name || namesToImport.includes(o.pokemon.name)
        )
        .map((o) => o.pokemon)
    );
  }, [ds, data, optItems, optPokeDollars, optWatts, optRareCandies, pkmOpts]);

  return !ds ? (
    <>Error when loading database. :(</>
  ) : (
    <>
      <FileInput
        required
        label={"Select spreadsheet file"}
        error={fileError}
        value={file}
        onChange={setFile}
        accept={
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.spreadsheet"
        }
      />

      <Title order={3}>Import Options</Title>
      <Stack p="md" style={{ position: "relative" }}>
        <LoadingOverlay
          visible={!workBook}
          loader={<Badge size="xl">Upload spreadsheet...</Badge>}
        />
        <Title order={4}>Inventory Data</Title>

        <List withPadding>
          <List.Item>
            <ImportOptionDisplay disabled={!workBook} importOption={optItems} />
          </List.Item>
          <List.Item>
            <ImportOptionDisplay
              disabled={!workBook}
              importOption={optPokeDollars}
            />
          </List.Item>
          <List.Item>
            <ImportOptionDisplay disabled={!workBook} importOption={optWatts} />
          </List.Item>
          <List.Item>
            <ImportOptionDisplay
              disabled={!workBook}
              importOption={optRareCandies}
            />
          </List.Item>
        </List>
        <Title order={4}>Pokemon</Title>
        <List withPadding>
          {pkmOpts.map((opt, index) => (
            <List.Item key={opt.pokemon.name}>
              <PokemonImportOptionDisplay
                index={index}
                pkmOptsHandler={pkmOptsHandler}
                pkmOpt={opt}
              />
            </List.Item>
          ))}
        </List>
      </Stack>
      <Group position="right">
        <Button
          variant="outline"
          color="yellow"
          onClick={() => context.closeModal(modalId)}
          leftIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          disabled={!workBook}
          color="green"
          onClick={async () => {
            setSavingData(true);
            await saveData();
            setSavingData(false);
            context.closeModal(modalId);
          }}
          leftIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Group>
      <LoadingOverlay visible={savingData} />
    </>
  );
}

function Inner_ButtonOpenSpreadsheetImportModal(
  props: any,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return <Button ref={ref}>Import Data from Spreadsheet</Button>;
}

export const ButtonOpenSpreadsheetImportModal = forwardRef<HTMLButtonElement>(
  Inner_ButtonOpenSpreadsheetImportModal
);

function useImportOption(optName: string) {
  const [value, setValue] = useState<boolean>(true);
  const [label, setLabel] = useState<string>("");
  const [overwriteWarning, setOverwriteWarning] = useState<boolean>(false);
  const warningComponent = useMemo(() => {
    if (!overwriteWarning) return <></>;
    return (
      <Alert color="orange" variant="outline" mx="xl" mb="md">
        Entries for {optName} already exist!
        <br />
        Importing will overwrite them.
      </Alert>
    );
  }, [optName, overwriteWarning]);

  return {
    value,
    setValue,
    label: `${optName} ${label}`,
    setLabel,
    overwriteWarning,
    setOverwriteWarning,
    warningComponent,
  };
}

function ImportOptionDisplay({
  disabled,
  importOption,
}: {
  disabled: boolean;
  importOption: ReturnType<typeof useImportOption>;
}) {
  return (
    <>
      <Switch
        disabled={disabled}
        label={importOption.label}
        checked={importOption.value}
        onChange={(event) => importOption.setValue(event.currentTarget.checked)}
        style={{ display: "inline-flex" }}
      />
      {importOption.warningComponent}
    </>
  );
}

type PokemonImportOptionDisplayProps = {
  index: number;
  pkmOptsHandler: UseListStateHandlers<PokemonImportOpt>;
  pkmOpt: PokemonImportOpt;
};
function PokemonImportOptionDisplay({
  index,
  pkmOptsHandler,
  pkmOpt,
}: PokemonImportOptionDisplayProps) {
  const { pokemon, importing, overwriteWarning } = pkmOpt;
  return (
    <>
      <Switch
        label={`${pokemon.name ?? "(Unnamed)"} the ${
          pokemon.species ?? "(Unknown Species)"
        }`}
        checked={importing}
        onChange={(event) =>
          pkmOptsHandler.setItemProp(
            index,
            "importing",
            event.currentTarget.checked
          )
        }
        style={{ display: "inline-flex" }}
      />
      {overwriteWarning && pokemon.name && (
        <Alert color="orange" variant="outline" mx="xl" mb="md">
          An entry for {pokemon.name} already exists!
          <br />
          Importing will overwrite that entry.
        </Alert>
      )}
    </>
  );
}
