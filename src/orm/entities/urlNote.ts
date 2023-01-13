import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UTCTransformerAllowNull } from "~/orm/ormUtil";
import { Dayjs } from "dayjs";

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

  @Column("integer", { nullable: true, transformer: UTCTransformerAllowNull })
  date: Dayjs | null;

  @Column("text", { nullable: true })
  postText: string | null = null;
}
