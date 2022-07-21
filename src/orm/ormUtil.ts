import { ValueTransformer } from 'typeorm';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export class TextWithSource {
    value: string;
    sourceUrl?: string;
}

export const UTCTransformer: ValueTransformer = {
    to: (value: Dayjs) => value ? value.utc().format() : '',
    from: (value: string) => dayjs(value).utc()
}
