import { Column, Entity, ManyToOne } from "typeorm";
import { Trainer, ItemDefinition } from "~/orm/entities";
import { ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
    orderBy: {
        timestamp: 'ASC'
    },
})
export class ItemLog extends ShopTrackedChangeLog {
    @Column('integer')
    quanityChange: number;

    @ManyToOne(() => ItemDefinition, {
        onDelete: 'SET NULL',
        cascade: ['insert', 'update'],
        nullable: true
    })
    itemDefinition?: ItemDefinition;

    @Column('simple-json', {
        nullable: true,
    })
    customDefinition?: Partial<ItemDefinition>;
}