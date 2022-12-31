import { InventoryEditItemDefModal } from "~/pageComponents/items/InventoryEditItemDefModal";
import { EditInventoryModal } from "~/pageComponents/items/EditInventoryModal";
import { FunctionComponent } from "react";
import { ContextModalProps } from "@mantine/modals";
import { SpreadsheetImportModal } from "~/components/spreadsheetImportModal";
import { PokemonImportFromFizzyDexModal } from "~/pageComponents/pokemon/PokemonImportFromFizzyDexModal";

export enum ModalName {
  ItemDefEditor = "ItemDefEditor",
  EditInventory = "EditInventory",
  ImportSpreadsheet = "ImportSpreadsheet",
  PokemonImportFromFizzyDex = "PokemonImportFromFizzyDex",
}

export const Modals: Record<
  ModalName,
  FunctionComponent<ContextModalProps<any>>
> = {
  [ModalName.ItemDefEditor]: InventoryEditItemDefModal,
  [ModalName.EditInventory]: EditInventoryModal,
  [ModalName.ImportSpreadsheet]: SpreadsheetImportModal,
  [ModalName.PokemonImportFromFizzyDex]: PokemonImportFromFizzyDexModal,
};
