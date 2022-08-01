import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { ItemDefinition } from "./itemDefinition";
import { ChangeLogBase } from "./changeLogBase";
import { UTCTransformer } from "~/orm/ormUtil";
import { Dayjs } from "dayjs";

@Entity({
  orderBy: {
    date: "ASC",
  },
})
export class ItemLog extends ChangeLogBase {
  @Column("integer")
  quantityChange: number;

  @Column("text", { nullable: true })
  itemDefinitionId: string | null;

  @ManyToOne(() => ItemDefinition, {
    onDelete: "SET NULL",
    nullable: true,
  })
  itemDefinition: ItemDefinition | null;

  @CreateDateColumn({
    type: "integer",
    transformer: UTCTransformer,
  })
  date: Dayjs;
}
