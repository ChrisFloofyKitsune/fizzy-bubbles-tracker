import { ContextModalProps, openContextModal } from "@mantine/modals";
import { LevelUpMove, Pokemon as PokemonEntity } from "~/orm/entities";
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FizzyDex, Form, Pokemon } from "fizzydex.js";
import {
  dexMoveLevelToString,
  FindFizzyDexPokemon,
  formatFormName,
  useFizzyDex,
} from "~/services/FizzyDexService";
import { Button, Group, Stack, Switch, Title, Tooltip } from "@mantine/core";
import { FizzyDexPokemonSelect } from "~/components/FizzyDexPokemonSelect";
import { AddIcon, PokeDexIcon, SaveIcon, WarningIcon } from "~/appIcons";
import { ModalName } from "~/modalsList";

export type FizzyDexImportData = {
  species: string | null;
  dexNum: string | null;
  type: string | null;
  ability: string | null;
  levelUpMoves: LevelUpMove[] | null;
  evolutionChain: {
    stageOne: string | null;
    stageTwoMethod: string | null;
    stageTwo: string | null;
    stageThreeMethod: string | null;
    stageThree: string | null;
  } | null;
  imageLink: string | null;
};

export type ImportFieldExistsMap = Record<keyof FizzyDexImportData, boolean>;

interface FizzyDexImportOption<
  T extends FizzyDexImportData[keyof FizzyDexImportData]
> {
  label: string;
  enabled: boolean;
  setEnabled: (value: ((prevState: boolean) => boolean) | boolean) => void;
  getValue: (form: Form | null) => T;
}

function useFizzyDexImportOption<
  T extends FizzyDexImportData[keyof FizzyDexImportData]
>(
  label: string,
  getValue: FizzyDexImportOption<T>["getValue"],
  startEnabled: boolean = false
): FizzyDexImportOption<T> {
  const [enabled, setEnabled] = useState(startEnabled);
  return {
    label,
    enabled,
    setEnabled,
    getValue,
  };
}

function useFizzyDexImportOptionMap(
  fizzyDex: typeof FizzyDex | null,
  importFieldExistsMap: ImportFieldExistsMap | null
) {
  return {
    species: useFizzyDexImportOption<FizzyDexImportData["species"]>(
      "Species",
      (form) => {
        return form ? formatFormName(form) : null;
      },
      !importFieldExistsMap?.species
    ),
    dexNum: useFizzyDexImportOption<FizzyDexImportData["dexNum"]>(
      "Dex No.",
      (form) => {
        return form?.Pokemon.DexNum.toString() ?? null;
      },
      !importFieldExistsMap?.dexNum
    ),
    ability: useFizzyDexImportOption<FizzyDexImportData["ability"]>(
      "Ability",
      (form) => {
        const opts = form
          ? [form.Ability1, form.Ability2, form.HiddenAbility].filter(
              (a) => !!a
            )
          : [];
        return opts.join(" OR ") || null;
      },
      !importFieldExistsMap?.ability
    ),
    type: useFizzyDexImportOption<FizzyDexImportData["type"]>(
      "Type",
      (form) => {
        return form
          ? `${form.PrimaryType}${
              form.SecondaryType ? ` / ${form.SecondaryType}` : ""
            }`
          : null;
      },
      !importFieldExistsMap?.type
    ),
    levelUpMoves: useFizzyDexImportOption<FizzyDexImportData["levelUpMoves"]>(
      "Level Up Moves",
      (form) => {
        return form
          ? form.GetMoves().LevelUpMoves.map((m) => {
              const move = new LevelUpMove();
              move.move = m.Name;
              move.level = dexMoveLevelToString(m.Level);
              return move;
            })
          : null;
      },
      !importFieldExistsMap?.levelUpMoves
    ),
    evolutionChain: useFizzyDexImportOption<
      FizzyDexImportData["evolutionChain"]
    >(
      "Evolution Chain",
      (form) => {
        if (!fizzyDex || !form) {
          return null;
        }

        const formName = form.FormName;
        const evoChains =
          form.Pokemon.EvolutionChains.filter(
            (ec) =>
              ec.Stage1Form === formName ||
              ec.Stage2Form === formName ||
              ec.Stage3Form === formName
          ) ?? [];

        const result: FizzyDexImportData["evolutionChain"] = {
          stageOne: "",
          stageTwoMethod: "",
          stageTwo: "",
          stageThreeMethod: "",
          stageThree: "",
        };

        if (evoChains.length === 0) {
          return result;
        }

        result.stageOne = formatFormName(
          fizzyDex
            .GetPokemon(evoChains[0].Stage1DexNum)
            .GetForm(evoChains[0].Stage1Form)
        );

        result.stageTwoMethod = evoChains
          .filter((ec) => !!ec.Stage2Method)
          .map((ec) => ec.Stage2Method)
          .join(" / ");

        result.stageTwo = evoChains
          .filter((ec) => !!ec.Stage2DexNum)
          .map((ec) =>
            formatFormName(
              fizzyDex.GetPokemon(ec.Stage2DexNum).GetForm(ec.Stage2Form)
            )
          )
          .join(" / ");

        result.stageThreeMethod = evoChains
          .filter((ec) => !!ec.Stage3Method)
          .map((ec) => ec.Stage3Method)
          .join(" / ");

        result.stageThree = evoChains
          .filter((ec) => !!ec.Stage3DexNum)
          .map((ec) =>
            formatFormName(
              fizzyDex.GetPokemon(ec.Stage3DexNum!).GetForm(ec.Stage3Form!)
            )
          )
          .join(" / ");

        return result;
      },
      !importFieldExistsMap?.evolutionChain
    ),
    imageLink: useFizzyDexImportOption<FizzyDexImportData["imageLink"]>(
      "Image Link",
      (form) => form?.ArtworkURL || null,
      !importFieldExistsMap?.imageLink
    ),
  };
}

export type DisplayImportOptionProps<
  T extends FizzyDexImportData[keyof FizzyDexImportData]
> = {
  importOption: FizzyDexImportOption<T>;
  showWarning: boolean;
  children: ReactNode;
};

function DisplayImportOption<
  T extends FizzyDexImportData[keyof FizzyDexImportData]
>({
  importOption,
  showWarning,
  children,
}: DisplayImportOptionProps<T>): JSX.Element {
  if (children === null) {
    return <></>;
  }

  return (
    <Group
      sx={{
        alignItems: "baseline",
        verticalAlign: "middle",
      }}
    >
      {showWarning && (
        <Tooltip label="A value already exists for this option">
          <div>
            <WarningIcon
              size="24px"
              color="yellow"
              style={{ verticalAlign: "middle" }}
            />
          </div>
        </Tooltip>
      )}
      <Switch
        label={<Title order={4}>{importOption.label}</Title>}
        checked={importOption.enabled}
        onChange={(event) =>
          importOption.setEnabled(event.currentTarget.checked)
        }
      />
      {children}
    </Group>
  );
}

export type PokemonImportFromFizzyDexModalProps = {
  importFieldExistsMap: ImportFieldExistsMap | null;
  onImportSubmit: (
    importData: FizzyDexImportData,
    saveToExisting: boolean
  ) => Promise<any>;
  existingData?: Pick<PokemonEntity, "dexNum" | "species">;
};

export function PokemonImportFromFizzyDexModal({
  context,
  id: modalId,
  innerProps: props,
}: ContextModalProps<PokemonImportFromFizzyDexModalProps>) {
  const fizzyDex = useFizzyDex();
  const importOptionMap = useFizzyDexImportOptionMap(
    fizzyDex,
    props.importFieldExistsMap
  );

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  useEffect(() => {
    if (!props.existingData) return;

    const result = FindFizzyDexPokemon(props.existingData);
    if (!result) return;
    setSelectedPokemon(result.pokemon);
    setSelectedForm(result.form);
  }, [props.existingData]);

  const [loading, setLoading] = useState(false);

  const onImportClick = useCallback(
    async (saveToExisting: boolean) => {
      setLoading(true);
      const data: FizzyDexImportData = Object.entries(importOptionMap).reduce(
        (result, [key, opt]) => {
          result[key as keyof FizzyDexImportData] =
            opt.enabled || !saveToExisting
              ? (opt.getValue(selectedForm) as any)
              : null;
          return result;
        },
        {} as FizzyDexImportData
      );
      await props.onImportSubmit(data, saveToExisting);
      context.closeModal(modalId);
    },
    [context, modalId, props, importOptionMap, selectedForm]
  );

  return (
    <>
      <FizzyDexPokemonSelect
        pokemonSelection={selectedPokemon}
        onPokemonSelect={setSelectedPokemon}
        formSelection={selectedForm}
        onFormSelect={setSelectedForm}
        clearable
      />
      {!selectedPokemon && <Title pt="lg">Select a Pokemon</Title>}
      {selectedPokemon && (
        <Stack spacing="xs" pt="lg">
          <DisplayImportOption
            importOption={importOptionMap.species}
            showWarning={!!props.importFieldExistsMap?.species}
          >
            {importOptionMap.species.getValue(selectedForm)}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.dexNum}
            showWarning={!!props.importFieldExistsMap?.dexNum}
          >
            {importOptionMap.dexNum.getValue(selectedForm)}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.type}
            showWarning={!!props.importFieldExistsMap?.type}
          >
            {importOptionMap.type.getValue(selectedForm)}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.ability}
            showWarning={!!props.importFieldExistsMap?.ability}
          >
            {importOptionMap.ability.getValue(selectedForm)}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.levelUpMoves}
            showWarning={!!props.importFieldExistsMap?.levelUpMoves}
          >
            {importOptionMap.levelUpMoves
              .getValue(selectedForm)
              ?.map((m) => `(${m.level}) ${m.move}`)
              .join(", ")}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.evolutionChain}
            showWarning={!!props.importFieldExistsMap?.evolutionChain}
          >
            {(() => {
              const evoChain =
                importOptionMap.evolutionChain.getValue(selectedForm);
              if (!evoChain) return null;
              return (
                evoChain.stageOne +
                (evoChain.stageTwo
                  ? ` -(${evoChain.stageTwoMethod})> ${evoChain.stageTwo}` +
                    (evoChain.stageThree
                      ? ` -(${evoChain.stageTwoMethod})> ${evoChain.stageTwo}`
                      : "")
                  : "")
              );
            })()}
          </DisplayImportOption>
          <DisplayImportOption
            importOption={importOptionMap.imageLink}
            showWarning={!!props.importFieldExistsMap?.imageLink}
          >
            {importOptionMap.imageLink.getValue(selectedForm)}
          </DisplayImportOption>
        </Stack>
      )}
      <Group pt="lg">
        {!!props.importFieldExistsMap && (
          <Button
            loading={loading}
            disabled={
              !selectedPokemon ||
              !Object.values(importOptionMap).some((opt) => opt.enabled)
            }
            leftIcon={<SaveIcon />}
            onClick={async () => await onImportClick(true)}
          >
            Save to Current Pokemon
          </Button>
        )}
        <Button
          loading={loading}
          disabled={!selectedPokemon}
          leftIcon={<AddIcon />}
          color="green"
          onClick={async () => await onImportClick(false)}
        >
          Save as New Pokemon
        </Button>
      </Group>
    </>
  );
}

function Inner_ButtonOpenFizzyDexImportModal(
  props: PokemonImportFromFizzyDexModalProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <Button
      ref={ref}
      leftIcon={<PokeDexIcon />}
      onClick={() =>
        openContextModal({
          modal: ModalName.PokemonImportFromFizzyDex,
          title: <Title order={2}>Import from FizzyDex</Title>,
          size: "lg",
          innerProps: props,
        })
      }
    >
      Import Data from FizzyDex
    </Button>
  );
}

export const ButtonOpenFizzyDexImportModal = forwardRef<
  HTMLButtonElement,
  PokemonImportFromFizzyDexModalProps
>(Inner_ButtonOpenFizzyDexImportModal);
