import { ValueTransformer } from 'typeorm';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const UTCTransformer: ValueTransformer = {
    to: (value: Dayjs) => value ? value.utc().format() : '',
    from: (value: string) => dayjs(value).utc()
};

export function wrapUrlIfLink(value: any, link?: string) {
    return link ? `[url=${link}]${value}[/url]` : value;
}
