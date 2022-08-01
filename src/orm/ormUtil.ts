import { ValueTransformer } from "typeorm";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const UTCTransformer: ValueTransformer = {
  to: (value: Dayjs | string): number => {
    if (typeof value === "string") {
      return dayjs.utc(value, "DD-MMM-YYYY").valueOf();
    }
    return value ? value.utc().valueOf() : dayjs().utc().valueOf();
  },
  from: (value: number) => dayjs(value).utc(),
};

export function wrapUrlIfLink(value: any, link?: string | null) {
  return link ? `[url=${link}]${value}[/url]` : value;
}
