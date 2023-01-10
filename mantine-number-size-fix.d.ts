import { MantineSize } from "@mantine/core";

export declare type CSSFontRelativeLength = `${number}${
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
export declare type CSSViewportVariantBase<T extends string> = `${T}${
  | "vw"
  | "vh"
  | "vi"
  | "vb"
  | "vmin"
  | "vmax"}`;
export declare type CSSViewportPercentageLength =
  `${number}${CSSViewportVariantBase<"" | "l" | "s" | "d">}`;
export declare type CSSRelativeLength =
  | CSSFontRelativeLength
  | CSSViewportPercentageLength;
export declare type CSSAbsoluteLength = `${number}${
  | "cm"
  | "mm"
  | "Q"
  | "in"
  | "pt"
  | "pc"
  | "px"}`;
export declare type CSSLength = CSSRelativeLength | CSSAbsoluteLength;
export declare type CSSPercentage = `${number}%`;
export declare type CSSLengthPercentage = CSSLength | CSSPercentage;

export declare module "@mantine/styles" {
  export declare type MantineNumberSize =
    | MantineSize
    | number
    | CSSLengthPercentage
    | `${number}`;
}
