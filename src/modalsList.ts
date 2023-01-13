import { InventoryEditItemDefModal } from "~/pageComponents/items/InventoryEditItemDefModal";
import { EditInventoryModal } from "~/pageComponents/items/EditInventoryModal";
import { FunctionComponent } from "react";
import { ContextModalProps } from "@mantine/modals";
import { SpreadsheetImportModal } from "~/components/spreadsheetImportModal";
import { PokemonImportFromFizzyDexModal } from "~/pageComponents/pokemon/PokemonImportFromFizzyDexModal";
import { CreateItemDefModal } from "~/pageComponents/post-summaries/CreateItemDefModal";
import { AddPokemonChangeOptionModal } from "~/pageComponents/post-summaries/AddPokemonChangeOptionModal";

export enum ModalName {
  ItemDefEditor = "ItemDefEditor",
  EditInventory = "EditInventory",
  ImportSpreadsheet = "ImportSpreadsheet",
  PokemonImportFromFizzyDex = "PokemonImportFromFizzyDex",
  CreateItemDef = "CreateItemDef",
  AddPokemonChangeOption = "AddPokemonChangeOption",
}

export const Modals: Record<
  ModalName,
  FunctionComponent<ContextModalProps<any>>
> = {
  [ModalName.ItemDefEditor]: InventoryEditItemDefModal,
  [ModalName.EditInventory]: EditInventoryModal,
  [ModalName.ImportSpreadsheet]: SpreadsheetImportModal,
  [ModalName.PokemonImportFromFizzyDex]: PokemonImportFromFizzyDexModal,
  [ModalName.CreateItemDef]: CreateItemDefModal,
  [ModalName.AddPokemonChangeOption]: AddPokemonChangeOptionModal,
};
