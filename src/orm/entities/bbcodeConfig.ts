import { Column, Entity, IsNull, PrimaryColumn } from "typeorm";

@Entity()
export class BBCodeConfig {
    @PrimaryColumn()
    specifier: string;

    @Column()
    template: string;
}