import { JoinColumn } from "typeorm";
import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { Pokemon } from "./pokemon";

@Entity()
export class BondStylingConfig {
  @PrimaryColumn()
  pokemonUuid: string;

  @OneToOne(() => Pokemon, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  @JoinColumn()
  pokemon: Pokemon;

  @Column("text", { nullable: true })
  colorCode: string | null = null;

  @Column("text", { nullable: true })
  iconImageLink: string | null = null;

  @Column("text", { nullable: true })
  preHeaderBBCode: string | null = null;

  @Column("text", { nullable: true })
  postHeaderBBCode: string | null = null;

  @Column("text", { nullable: true })
  preFooterBBCode: string | null = null;

  @Column("text", { nullable: true })
  postFooterBBCode: string | null = null;
}
