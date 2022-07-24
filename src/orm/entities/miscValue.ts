import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class MiscValue {
    @PrimaryColumn('text')
    key: string;

    @Column('text', { nullable: true})
    value?: string;
}