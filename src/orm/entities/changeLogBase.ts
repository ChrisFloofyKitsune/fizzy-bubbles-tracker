import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import dayjs, { Dayjs } from 'dayjs';
import { UTCTransformer } from "../ormUtil";

export abstract class ChangeLogBase {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({
        type: 'text',
        transformer: UTCTransformer,

    })
    timestamp: Dayjs;

    @Column({ nullable: true })
    sourceUrl?: string;

    @Column({ nullable: true })
    sourceNote?: string;
}

export abstract class ShopTrackedChangeLog extends ChangeLogBase {
    @Column({
        type: 'boolean',
        default: false
    })
    verifiedInShopUpdate: boolean = false;
}
