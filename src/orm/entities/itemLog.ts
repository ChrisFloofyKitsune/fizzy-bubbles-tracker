import { Column, Entity, ManyToOne } from "typeorm";
import { ItemDefinition } from "~/orm/entities";
import { ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
  orderBy: {
    date: "ASC",
  },
})
export class ItemLog extends ShopTrackedChangeLog {
  @Column("integer")
  quantityChange: number;

  @ManyToOne(() => ItemDefinition, {
    onDelete: "SET NULL",
    cascade: ["insert", "update"],
    nullable: true,
  })
  itemDefinition?: ItemDefinition;

  @Column("simple-json", {
    nullable: true,
  })
  customDefinition?: Partial<ItemDefinition>;
}
