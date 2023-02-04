import { createStyles, CSSObject, MantineTheme } from "@mantine/core";
import { IconType } from "react-icons";
import { GiPokecog } from "react-icons/gi";
import { BiIdCard } from "react-icons/bi";
import {
  TbHome,
  TbPokeball,
  TbBackpack,
  TbWallet,
  TbWriting,
  TbHeartHandshake,
  TbClipboardList,
} from "react-icons/tb";

export class NavOption {
  useStyle: () => {
    classes: Record<"className", string>;
    cx: (...args: any) => string;
    theme: MantineTheme;
  };

  public useClass(): string {
    return this.useStyle().classes.className;
  }

  constructor(
    public readonly pageName: string,
    public readonly path: string,
    public readonly icon: IconType,
    cssFunc?: (theme: MantineTheme) => CSSObject
  ) {
    this.useStyle = createStyles((theme) => ({
      className: cssFunc ? cssFunc(theme) : {},
    }));
  }
}

export const NavOptionList = [
  new NavOption("Home", "/", TbHome),
  new NavOption("Trainers", "/trainers", BiIdCard),
  new NavOption("Pokemon", "/pokemon", TbPokeball, () => ({
    "&:hover .mantine-ThemeIcon-root > svg": {
      transform: "rotate(60deg)",
    },
  })),
  new NavOption("Items", "/items", TbBackpack),
  new NavOption("Wallet", "/wallet", TbWallet),
  new NavOption("Bond", "/bond", TbHeartHandshake),
  new NavOption("Word Counter", "/word-counter", TbWriting),
  new NavOption("Post Summaries", "/post-summaries", TbClipboardList),
  new NavOption("Settings", "/settings", GiPokecog, () => ({
    marginTop: "auto",
    "&:hover": {
      "& .mantine-ThemeIcon-root > svg": {
        transform: "rotate(120deg)",
      },
    },
  })),
];
