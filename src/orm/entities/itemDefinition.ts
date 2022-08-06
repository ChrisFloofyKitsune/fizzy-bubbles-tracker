import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemLog } from "./itemLog";

@Entity()
export class ItemDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text", { default: "" })
  name: string;

  @Column("text", { nullable: true })
  category: string | null;

  @Column("text", { nullable: true })
  imageLink: string | null;

  @Column("text", { nullable: true })
  description: string | null;

  @OneToMany(() => ItemLog, (log) => log.itemDefinition, {
    cascade: true,
  })
  itemLogs: ItemLog[];
}
