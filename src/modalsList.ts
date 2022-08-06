import { InventoryEditItemDefModal } from "~/pageComponents/items/InventoryEditItemDefModal";
import { EditInventoryModal } from "~/pageComponents/items/EditInventoryModal";
import { FC } from "react";
import { ContextModalProps } from "@mantine/modals";

export enum ModalName {
  ItemDefEditor = "ItemDefEditor",
  EditInventory = "EditInventory",
}

export const Modals: Record<ModalName, FC<ContextModalProps<any>>> = {
  [ModalName.ItemDefEditor]: InventoryEditItemDefModal,
  [ModalName.EditInventory]: EditInventoryModal,
};
