import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
