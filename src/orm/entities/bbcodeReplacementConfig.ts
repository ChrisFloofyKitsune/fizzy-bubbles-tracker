import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class BBCodeReplacementConfig {
    @PrimaryColumn()
    specifier: string;

    @Column('text', { nullable: true })
    customTemplate?: string;

    @Column('text', { nullable: true })
    replaceWithProperty: string | null;
}