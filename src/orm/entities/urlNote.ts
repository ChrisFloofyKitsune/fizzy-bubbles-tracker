import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { makeLocalDateTransformer } from "~/orm/makeLocalDateTransformer";
import { LocalDate } from "@js-joda/core";

@Entity({
  orderBy: {
    date: { order: "DESC", nulls: "NULLS LAST" },
  },
})
export class UrlNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column("text", { nullable: true })
  label: string | null = null;

  @Column("blob", {
    nullable: true,
    transformer: makeLocalDateTransformer(true),
  })
  date: LocalDate | null;

  @Column("text", { nullable: true })
  postText: string | null = null;
}
