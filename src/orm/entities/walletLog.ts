import { Column, Entity } from "typeorm";
import { CurrencyType } from "../enums";
import { ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
  orderBy: {
    date: "ASC",
  },
})
export class WalletLog extends ShopTrackedChangeLog {
  @Column("text")
  currencyType: CurrencyType;

  @Column("integer", {
    default: 0,
  })
  quantityChange: number;
}
