import { ChangeLogBase, ShopTrackedChangeLog } from "~/orm/entities";
import { DataTable, DataTableProps, PropConfigEntry } from "./dataTable";
import { createStyles, CSSObject } from "@mantine/core";
import { useMemo } from "react";
import { createStringPropConfig } from "./configCreators/createStringPropConfig";
import { createUrlPropConfig } from "~/components/dataTable/configCreators/createUrlPropConfig";
import { createDayjsPropConfig } from "~/components/dataTable/configCreators/createDayjsPropConfig";
import { createBooleanPropConfig } from "~/components/dataTable/configCreators/createBooleanPropConfig";

const useLogTableStyles = createStyles(
  (theme) =>
    ({
      sourceNote: {},
      sourceUrl: {},
      date: {
        width: "7em",
      },
      verifiedInShopUpdate: {
        width: "6em",
      },
    } as Record<keyof ShopTrackedChangeLog, CSSObject>)
);

export type LogDataTableProps<T extends ChangeLogBase | ShopTrackedChangeLog> =
  DataTableProps<T> & {
    isShopLog: T extends ShopTrackedChangeLog ? true : false;
  };
export function LogDataTable<T extends ChangeLogBase | ShopTrackedChangeLog>({
  isShopLog,
  ...tableProps
}: LogDataTableProps<T>) {
  const finalConfig = useMemo(() => {
    const result = Object.assign({}, tableProps.propConfig);
    function addIfMissingForProp<K>(
      prop: keyof K,
      headerLabel: string,
      order: number,
      createFunction: (
        prop: any,
        headerLabel: string,
        order: number
      ) => PropConfigEntry<K, keyof K>
    ): void {
      if (!(result as any)[prop]) {
        (result as any)[prop] = createFunction(prop, headerLabel, order);
      }
    }

    addIfMissingForProp<ChangeLogBase>(
      "sourceNote",
      "Note",
      101,
      createStringPropConfig
    );
    addIfMissingForProp<ChangeLogBase>(
      "sourceUrl",
      "Link",
      102,
      createUrlPropConfig
    );

    if (isShopLog) {
      addIfMissingForProp<ShopTrackedChangeLog>(
        "date",
        "Date",
        201,
        createDayjsPropConfig
      );
      addIfMissingForProp<ShopTrackedChangeLog>(
        "verifiedInShopUpdate",
        "Shop Verified?",
        202,
        createBooleanPropConfig
      );
    }
    return result;
  }, [isShopLog, tableProps.propConfig]);

  const logTableStyles = useLogTableStyles();
  const finalClasses: Record<string, string> = useMemo(() => {
    const inputClasses = tableProps.propsToMantineClasses as
      | Record<string, string>
      | undefined;
    if (!inputClasses) {
      return logTableStyles.classes;
    }
    const results: Record<string, string> = Object.assign(
      {},
      logTableStyles.classes
    );
    Object.entries(inputClasses).map(([p, c]) => {
      if (results[p]) {
        results[p] = logTableStyles.cx(results[p], c);
      } else {
        results[p] = c;
      }
    });
    return results;
  }, [logTableStyles, tableProps.propsToMantineClasses]);

  return (
    <DataTable
      {...tableProps}
      propConfig={finalConfig}
      propsToMantineClasses={finalClasses}
    />
  );
}
