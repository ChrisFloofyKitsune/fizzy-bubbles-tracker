import { Column, Entity } from "typeorm";
import { CurrencyType } from "../enums";
import { ShopTrackedChangeLog } from "./changeLogBase";

@Entity({
  orderBy: {
    date: "ASC",
  },
})
export class WalletLog extends ShopTrackedChangeLog {
  @Column("text", { default: CurrencyType.POKE_DOLLAR })
  currencyType: CurrencyType;

  @Column("integer", {
    default: 0,
  })
  quantityChange: number;

  static createBBCode(logs: WalletLog[], type: CurrencyType) {
    logs = logs.filter(
      (l) => l.currencyType === type && l.quantityChange !== 0
    );

    type Data = {
      starting: number;
      ending: number;
      deposits: WalletLog[];
      depositSubtotal: number;
      withdrawals: WalletLog[];
      withdrawalSubtotal: number;
    };

    const data: Data = logs.reduce(
      (total, log) => {
        if (log.verifiedInShopUpdate) {
          total.starting += log.quantityChange;
        } else {
          if (log.quantityChange >= 0) {
            total.deposits.push(log);
            total.depositSubtotal += log.quantityChange;
          } else {
            total.withdrawals.push(log);
            total.withdrawalSubtotal += log.quantityChange;
          }
        }
        total.ending += log.quantityChange;
        return total;
      },
      {
        starting: 0,
        ending: 0,
        deposits: [],
        depositSubtotal: 0,
        withdrawals: [],
        withdrawalSubtotal: 0,
      } as Data
    );

    function fmtQ(value: number, sign: boolean = false): string {
      const signText = !sign ? "" : value <= 0 ? "" : "+";
      switch (type) {
        case CurrencyType.POKE_DOLLAR:
          return `${signText}$${value}`;
        case CurrencyType.WATTS:
          return `${signText}${value} Watt${value === 1 ? "" : "s"}`;
        case CurrencyType.RARE_CANDY:
          return `${signText}${value} Rare Cand${value === 1 ? "y" : "ies"}`;
      }
    }

    function fmtLog({
      quantityChange,
      date,
      sourceUrl,
      sourceNote,
    }: WalletLog): string {
      const start = sourceUrl ? `[URL=${sourceUrl}]` : "";
      const middle = `${fmtQ(quantityChange, true)}${
        sourceNote ? " - " + sourceNote : ""
      }`;
      const end = sourceUrl ? "[/URL]" : "";
      return `${start}${middle} (${date.format("DD-MMM-YYYY")})${end}`;
    }

    return `Starting ${
      type === CurrencyType.RARE_CANDY ? "Total" : "Balance"
    }: ${fmtQ(data.starting)}

Deposits:
${data.deposits.map((l) => fmtLog(l)).join("\n")}${
      data.depositSubtotal === 0
        ? ""
        : `\nSubtotal: ${fmtQ(data.depositSubtotal, true)}\n`
    }
Withdrawals:
${data.withdrawals.map((l) => fmtLog(l)).join("\n")}${
      data.withdrawalSubtotal === 0
        ? ""
        : `\nSubtotal: ${fmtQ(data.depositSubtotal, true)}\n`
    }
Ending ${type === CurrencyType.RARE_CANDY ? "Total" : "Balance"}: ${fmtQ(
      data.ending
    )}
`;
  }
}
