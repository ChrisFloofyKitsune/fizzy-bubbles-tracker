import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Pokemon } from "~/orm/entities";

@Entity()
export class Trainer {
  @PrimaryGeneratedColumn("uuid")
  uuid: string;

  @Column()
  name: string;

  @Column({
    default: "",
  })
  bbcodeProfile: string;

  @OneToMany(() => Pokemon, (pokemon) => pokemon.trainer, {
    onDelete: "SET NULL",
    eager: false,
  })
  pokemon: Pokemon[];
}
