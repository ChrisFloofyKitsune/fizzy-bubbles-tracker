import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class ItemDefinition {
  @PrimaryColumn()
  name: string;

  @Column()
  category: string;

  @Column("text", {
    nullable: true,
  })
  imageLink: string | null;

  @Column()
  description: string;
}
