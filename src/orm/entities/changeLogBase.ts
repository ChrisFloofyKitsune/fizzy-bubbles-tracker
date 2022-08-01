import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { Dayjs } from "dayjs";
import { UTCTransformer } from "../ormUtil";

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
    type: "integer",
    transformer: UTCTransformer,
  })
  date: Dayjs;

  @Column({
    type: "boolean",
    default: false,
  })
  verifiedInShopUpdate: boolean = false;
}
