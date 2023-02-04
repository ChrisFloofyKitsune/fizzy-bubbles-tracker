import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { makeLocalDateTransformer } from "~/orm/makeLocalDateTransformer";
import { LocalDate } from "@js-joda/core";

export abstract class ChangeLogBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text", { nullable: true })
  sourceUrl: string | null;

  @Column("text", { nullable: true })
  sourceNote: string | null;
}

export abstract class ShopTrackedChangeLog extends ChangeLogBase {
  @CreateDateColumn({
    type: "blob",
    transformer: makeLocalDateTransformer(false),
  })
  date: LocalDate;

  @Column({
    type: "boolean",
    default: false,
  })
  verifiedInShopUpdate: boolean = false;
}
