import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { Dayjs } from "dayjs";
import { UTCTransformer } from "../ormUtil";

export abstract class ChangeLogBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sourceUrl?: string;

  @Column({ nullable: true })
  sourceNote?: string;
}

export abstract class ShopTrackedChangeLog extends ChangeLogBase {
  @CreateDateColumn({
    type: "text",
    transformer: UTCTransformer,
  })
  timestamp: Dayjs;

  @Column({
    type: "boolean",
    default: false,
  })
  verifiedInShopUpdate: boolean = false;
}
