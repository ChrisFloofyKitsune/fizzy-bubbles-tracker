import { ValueTransformer } from "typeorm";
import { Instant, LocalDate, ZoneId } from "@js-joda/core";

interface LocalDateTransformer<AllowNull extends boolean = true>
  extends ValueTransformer {
  from(
    value: number | string | null
  ): AllowNull extends true ? LocalDate | null : LocalDate;

  to(value: LocalDate | null): AllowNull extends true ? string | null : string;
}

export function makeLocalDateTransformer<AllowNullFlag extends boolean = true>(
  allowNullFlag: AllowNullFlag = true as AllowNullFlag
): LocalDateTransformer<AllowNullFlag> {
  return {
    from(value) {
      if (value === null) {
        if (allowNullFlag) {
          return null as any;
        } else {
          return LocalDate.now(ZoneId.UTC);
        }
      }
      return typeof value === "number"
        ? LocalDate.ofInstant(Instant.ofEpochMilli(value), ZoneId.UTC)
        : LocalDate.parse(value);
    },
    to(value) {
      if (value === null) {
        if (allowNullFlag) {
          return null as any;
        } else {
          return LocalDate.now(ZoneId.UTC).toString();
        }
      }
      return value.toString();
    },
  };
}
