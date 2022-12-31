import { ContextModalProps, openContextModal } from "@mantine/modals";
import { LevelUpMove, Pokemon as PokemonEntity } from "~/orm/entities";
import {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { FizzyDex, Form, Pokemon } from "fizzydex.js";
import {
  dexMoveLevelToString,
  formatFormName,
  useFizzyDex,
} from "~/services/FizzyDexService";
import { Button, Group, Stack, Switch, Title, Tooltip } from "@mantine/core";
import { FizzyDexPokemonSelect } from "~/components/FizzyDexPokemonSelect";
import { AddIcon, PokeDexIcon, SaveIcon, WarningIcon } from "~/appIcons";
import { ModalName } from "~/modalsList";

const ImportOpts: (
  | keyof Pick<
      PokemonEntity,
      "species" | "dexNum" | "type" | "ability" | "imageLink" | "levelUpMoves"
    >
  | "evolutionChain"
)[] = [
  "species",
  "dexNum",
  "type",
  "ability",
  "imageLink",
  "evolutionChain",
  "levelUpMoves",
];

interface FizzyDexImportOption<T> {
  label: string;
  enabled: boolean;
  setEnabled: (value: ((prevState: boolean) => boolean) | boolean) => void;
  getValue: (pokemon: Pokemon | null, form: Form | null) => T;
  showWarning: boolean;
}

function useFizzyDexImportOption<T = string>(
  label: string,
  getNewValue: FizzyDexImportOption<T>["getValue"],
  startEnabled: boolean = false
): FizzyDexImportOption<T> {
  const [enabled, setEnabled] = useState(startEnabled);
  return {
    label,
    enabled,
    setEnabled,
    getValue: getNewValue,
    showWarning: !startEnabled,
  };
}

function useFizzyDexImportOptionMap(
  fizzyDex: typeof FizzyDex | null,
  existingPokemon?: PokemonEntity
) {
  return {
    species: useFizzyDexImportOption(
      "Species",
      (pokemon, form) => {
        return form ? formatFormName(form) : pokemon?.Name ?? "";
      },
      !existingPokemon?.species
    ),
    dexNum: useFizzyDexImportOption(
      "Dex No.",
      (pokemon) => {
        return pokemon?.DexNum.toString() ?? "";
      },
      !existingPokemon?.dexNum
    ),
    ability: useFizzyDexImportOption(
      "Ability",
      (pokemon, form) => {
        const opts = form
          ? [form.Ability1, form.Ability2, form.HiddenAbility].filter(
              (a) => !!a
            )
          : [];
        return opts.join(" / ");
      },
      !existingPokemon?.ability
    ),
    type: useFizzyDexImportOption(
      "Type",
      (pokemon, form) => {
        return form
          ? `${form.PrimaryType}${
              form.SecondaryType ? ` / ${form.SecondaryType}` : ""
            }`
          : "";
      },
      !existingPokemon?.type
    ),
    evolutionChain: useFizzyDexImportOption<{
      stageOne: string;
      stageTwoMethod: string;
      stageTwo: string;
      stageThreeMethod: string;
      stageThree: string;
    }>(
      "Evolution Chain",
      (pokemon, form) => {
        const result = {
          stageOne: "",
          stageTwoMethod: "",
          stageTwo: "",
          stageThreeMethod: "",
          stageThree: "",
        };

        if (!fizzyDex) {
          return result;
        }

        const formName = form?.FormName ?? pokemon?.DefaultFormName;
        const evoChains =
          pokemon?.EvolutionChains.filter(
            (ec) =>
              ec.Stage1Form === formName ||
              ec.Stage2Form === formName ||
              ec.Stage3Form === formName
          ) ?? [];

        if (evoChains.length > 0) {
          result.stageOne = formatFormName(
            fizzyDex
              .GetPokemon(evoChains[0].Stage1DexNum)
              .GetForm(evoChains[0].Stage1Form)
          );

          result.stageTwoMethod = evoChains
            .map((ec) => ec.Stage2Method)
            .join(" / ");
          result.stageTwo = evoChains
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
        }

        return result;
      },
      !existingPokemon?.evolutionStageOne
    ),
    levelUpMoves: useFizzyDexImportOption<LevelUpMove[]>(
      "Level Up Moves",
      (pokemon, form) => {
        return !form
          ? []
          : form.GetMoves().LevelUpMoves.map((m) => ({
              move: m.Name,
              level: dexMoveLevelToString(m.Level),
            }));
      },
      !existingPokemon?.levelUpMoves
    ),
  };
}

export type PokemonImportFromFizzyDexModalProps = {
  existingPokemonEntity: PokemonEntity;
  onImportSubmit: (
    pokemon: PokemonEntity,
    saveToExisting: boolean
  ) => Promise<any>;
};

export function PokemonImportFromFizzyDexModal({
  context,
  id: modalId,
  innerProps: props,
}: ContextModalProps<PokemonImportFromFizzyDexModalProps>) {
  const fizzyDex = useFizzyDex();
  const importOptionMap = useFizzyDexImportOptionMap(fizzyDex);

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const hasEvoChain: boolean = useMemo(
    () => (selectedPokemon?.EvolutionChains?.length ?? 0) > 0,
    [selectedPokemon]
  );

  const [loading, setLoading] = useState(false);

  const displayOption = useCallback(
    (
      option: FizzyDexImportOption<any>,
      displayMode: "label" | "move list" | "evo chains" = "label"
    ) => {
      if (!selectedPokemon || !selectedForm) {
        return <></>;
      }

      const value = option.getValue(selectedPokemon, selectedForm);
      let displayElement: ReactNode = "";

      switch (displayMode) {
        case "label":
          displayElement = value;
          break;
        case "move list":
          displayElement = (value as LevelUpMove[])
            .map((m) => `(${m.level}) ${m.move}`)
            .join(", ");
          break;
        case "evo chains":
          if (!hasEvoChain) {
            displayElement = "(Does not evolve)";
            break;
          }

          let evoChain = value as ReturnType<
            typeof importOptionMap["evolutionChain"]["getValue"]
          >;
          displayElement = `${evoChain.stageOne}`;
          if (!!evoChain.stageTwo) {
            displayElement += ` -(${evoChain.stageTwoMethod})> ${evoChain.stageTwo}`;
          }
          if (!!evoChain.stageThree) {
            displayElement += ` -(${evoChain.stageThreeMethod})> ${evoChain.stageThree}`;
          }
          break;
      }

      return (
        <Group
          sx={{
            alignItems: "baseline",
            verticalAlign: "middle",
          }}
        >
          {option.showWarning && (
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
          {!!props.existingPokemonEntity ? (
            <Switch
              label={<Title order={4}>{option.label}</Title>}
              checked={option.enabled}
              onChange={(event) =>
                option.setEnabled(event.currentTarget.checked)
              }
            />
          ) : (
            <Title order={4}>{option.label}</Title>
          )}
          {displayElement}
        </Group>
      );
    },
    [hasEvoChain, props.existingPokemonEntity, selectedForm, selectedPokemon]
  );

  const onImportClick = useCallback(
    async (saveToExisting: boolean) => {
      setLoading(true);
      await props.onImportSubmit(new PokemonEntity(), saveToExisting);
      context.closeModal(modalId);
    },
    [context, modalId, props]
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
          {displayOption(importOptionMap.species)}
          {displayOption(importOptionMap.dexNum)}
          {displayOption(importOptionMap.type)}
          {displayOption(importOptionMap.ability)}
          {displayOption(importOptionMap.levelUpMoves, "move list")}
          {displayOption(importOptionMap.evolutionChain, "evo chains")}
        </Stack>
      )}
      <Group pt="lg">
        <Button
          loading={loading}
          disabled={
            !selectedPokemon ||
            !Object.values(importOptionMap).some((opt) => opt.enabled)
          }
          leftIcon={<AddIcon />}
          color="green"
          onClick={async () => await onImportClick(false)}
        >
          Save as New Pokemon
        </Button>
        {!!props.existingPokemonEntity && (
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
      </Group>
    </>
  );
}

export type ButtonOpenFizzyDexImportModalProps = {
  existingPokemon: PokemonEntity;
};

function Inner_ButtonOpenFizzyDexImportModal(
  props: ButtonOpenFizzyDexImportModalProps,
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
          innerProps: { existingPokemonEntity: props.existingPokemon },
        })
      }
    >
      Import Data from FizzyDex
    </Button>
  );
}

export const ButtonOpenFizzyDexImportModal = forwardRef<
  HTMLButtonElement,
  ButtonOpenFizzyDexImportModalProps
>(Inner_ButtonOpenFizzyDexImportModal);
