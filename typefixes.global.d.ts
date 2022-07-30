import type { MantineSize } from "@mantine/styles";
import type { DataSource } from "typeorm";
import type { PrismLib } from "prism-react-renderer";

type CSSFontRelativeLength = `${number}${
  | "em"
  | "rem"
  | "ex"
  | "rex"
  | "cap"
  | "rcap"
  | "ch"
  | "rch"
  | "ic"
  | "ric"
  | "lh"
  | "rlh"}`;
type CSSViewportVariantBase<T extends string> = `${T}${
  | "vw"
  | "vh"
  | "vi"
  | "vb"
  | "vmin"
  | "vmax"}`;
type CSSViewportPercentageLength = `${number}${CSSViewportVariantBase<
  "" | "l" | "s" | "d"
>}`;
type CSSRelativeLength = CSSFontRelativeLength | CSSViewportPercentageLength;
type CSSAboluteLength = `${number}${
  | "cm"
  | "mm"
  | "Q"
  | "in"
  | "pt"
  | "pc"
  | "px"}`;
type CSSLength = CSSRelativeLength | CSSAboluteLength;
type CSSPercentage = `${number}%`;
type CSSLengthPercentage = CSSLength | CSSPercentage;

declare module "@mantine/styles" {
  type MantineNumberSize =
    | MantineSize
    | number
    | CSSLengthPercentage
    | `${number}`;
}

declare global {
  interface Window {
    localforage: LocalForage;
    AppDataSource?: DataSource;
    Prism?: PrismLib;
  }
}

declare global {
  var Prism: PrismLib;
}
