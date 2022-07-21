import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class ItemDefinition {
    @PrimaryColumn()
    name: string;

    @PrimaryColumn()
    category: string;

    @Column({
        nullable: true
    })
    imageLink?: string;
    
    @Column()
    description: string;
}
