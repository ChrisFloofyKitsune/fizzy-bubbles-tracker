import { InventoryEditItemDefModal } from "~/page-components/items/InventoryEditItemDefModal";
import { EditInventoryModal } from "~/page-components/items/EditInventoryModal";
import { FunctionComponent } from "react";
import { ContextModalProps } from "@mantine/modals";
import { SpreadsheetImportModal } from "~/components/spreadsheetImportModal";
import { PokemonImportFromFizzyDexModal } from "~/page-components/pokemon/PokemonImportFromFizzyDexModal";
import { CreateItemDefModal } from "~/page-components/post-summaries/CreateItemDefModal";
import { AddPokemonChangeOptionModal } from "~/page-components/post-summaries/AddPokemonChangeOptionModal";
import { EditBondModal } from "~/page-components/bond/edit-bond-modal";

export enum ModalName {
  ItemDefEditor = "ItemDefEditor",
  EditInventory = "EditInventory",
  ImportSpreadsheet = "ImportSpreadsheet",
  PokemonImportFromFizzyDex = "PokemonImportFromFizzyDex",
  CreateItemDef = "CreateItemDef",
  AddPokemonChangeOption = "AddPokemonChangeOption",
  EditBondConfig = "EditBondConfig",
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
  [ModalName.EditBondConfig]: EditBondModal,
};
