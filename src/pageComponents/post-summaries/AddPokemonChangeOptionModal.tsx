import {
  canCreateSingletonOption,
  ChangeOptionPropsMap,
  PokemonChangeOption,
} from "~/pageComponents/post-summaries/PokemonChangeLog";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { ModalName } from "~/modalsList";
import { Select, Stack, Flex, Button } from "@mantine/core";
import { useMemo, useState } from "react";
import { AddIcon, CancelIcon } from "~/appIcons";
import { Pokemon } from "~/orm/entities";

export type AddPokemonChangeOptionModalProps = {
  onSelect?: (option: PokemonChangeOption) => void | Promise<void>;
  existingPokemon?: Pokemon;
  existingOptions?: PokemonChangeOption[];
};

export function AddPokemonChangeOptionModal(
  props: ContextModalProps<AddPokemonChangeOptionModalProps>
) {
  const { existingOptions, existingPokemon, onSelect } = props.innerProps;
  const [selectedOption, setSelectedOption] =
    useState<PokemonChangeOption | null>(null);

  const selectableOptions = useMemo(
    () =>
      Object.values(PokemonChangeOption)
        .filter(
          (option) =>
            (ChangeOptionPropsMap[option].allowMultiple ||
              !existingOptions?.includes(option)) &&
            (!existingPokemon ||
              !ChangeOptionPropsMap[option].singleton ||
              canCreateSingletonOption(existingPokemon, option))
        )
        .map((option) => ({
          label: option,
          value: option,
          group: ChangeOptionPropsMap[option].group,
        })),
    [existingOptions, existingPokemon]
  );

  return (
    <Stack spacing="xs">
      <Select
        searchable
        placeholder="Select or Search"
        value={selectedOption}
        onChange={(value) => setSelectedOption(value as PokemonChangeOption)}
        data={selectableOptions}
      />
      <Flex direction="row" gap="md">
        <Button
          color="green"
          leftIcon={<AddIcon />}
          onClick={async () => {
            if (!!selectedOption) {
              await onSelect?.(selectedOption);
            }
            props.context.closeModal(props.id);
          }}
        >
          Add
        </Button>
        <Button
          color={"orange"}
          variant="outline"
          leftIcon={<CancelIcon />}
          onClick={() => {
            props.context.closeModal(props.id, true);
          }}
        >
          Cancel
        </Button>
      </Flex>
    </Stack>
  );
}

export function OpenAddPokemonChangeModal(
  props: AddPokemonChangeOptionModalProps
) {
  openContextModal({
    modal: ModalName.AddPokemonChangeOption,
    title: "Select Pokemon Change",
    innerProps: props,
    centered: true,
  });
}
