import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { ItemDefinition } from "./itemDefinition";
import { ChangeLogBase } from "./changeLogBase";
import { makeLocalDateTransformer } from "~/orm/makeLocalDateTransformer";
import { LocalDate } from "@js-joda/core";

@Entity({
  orderBy: {
    date: "ASC",
  },
})
export class ItemLog extends ChangeLogBase {
  @Column("integer", { default: 0 })
  quantityChange: number;

  @Column("integer", { nullable: true })
  itemDefinitionId: number | null;

  @ManyToOne(() => ItemDefinition, (def) => def.itemLogs, {
    nullable: true,
    orphanedRowAction: "delete",
  })
  itemDefinition: ItemDefinition | null;

  @CreateDateColumn({
    type: "blob",
    transformer: makeLocalDateTransformer(false),
  })
  date: LocalDate;
}
