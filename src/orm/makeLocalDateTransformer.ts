import { ValueTransformer } from "typeorm";
import { DateTimeFormatter, Instant, LocalDate, ZoneId } from "@js-joda/core";

interface LocalDateTransformer<AllowNull extends boolean = true>
  extends ValueTransformer {
  from(
    value: number | string | null
  ): AllowNull extends true ? LocalDate | null : LocalDate;

  to(value: LocalDate | null): AllowNull extends true ? string | null : string;
}

const formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

export function makeLocalDateTransformer<AllowNullFlag extends boolean = true>(
  allowNullFlag: AllowNullFlag = true as AllowNullFlag
): LocalDateTransformer<AllowNullFlag> {
  return {
    from(value) {
      if (typeof value === "undefined" || value === null) {
        if (allowNullFlag) {
          return null as any;
        } else {
          return LocalDate.now(ZoneId.UTC);
        }
      }

      if (typeof value === "object" && (value as any) instanceof LocalDate) {
        return value;
      }

      return typeof value === "number"
        ? LocalDate.ofInstant(Instant.ofEpochMilli(value), ZoneId.UTC)
        : LocalDate.parse(value, formatter);
    },
    to(value) {
      if (typeof value === "undefined" || value === null) {
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
