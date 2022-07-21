import { Column, Entity } from "typeorm";
import { CurrencyType } from "../enums";
import { ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
    orderBy: {
        timestamp: 'ASC'
    },
})
export class WalletLog extends ShopTrackedChangeLog {
    @Column('text')
    currencyType: CurrencyType | string;

    @Column('integer')
    quanityChange: number;
}