import { InventoryEditItemDefModal } from "~/pageComponents/items/InventoryEditItemDefModal";
import { EditInventoryModal } from "~/pageComponents/items/EditInventoryModal";
import { FC } from "react";
import { ContextModalProps } from "@mantine/modals";
import { SpreadsheetImportModal } from "~/components/spreadsheetImportModal";

export enum ModalName {
  ItemDefEditor = "ItemDefEditor",
  EditInventory = "EditInventory",
  ImportSpreadsheet = "ImportSpreadsheet",
}

export const Modals: Record<ModalName, FC<ContextModalProps<any>>> = {
  [ModalName.ItemDefEditor]: InventoryEditItemDefModal,
  [ModalName.EditInventory]: EditInventoryModal,
  [ModalName.ImportSpreadsheet]: SpreadsheetImportModal,
};
