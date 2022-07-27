import { createStyles, CSSObject, MantineTheme } from "@mantine/core";
import { IconType } from "react-icons/lib";
import { GiPokecog } from "react-icons/gi";
import { BiIdCard } from 'react-icons/bi';
import { TbHome, TbPokeball, TbBackpack, TbWallet, TbDatabase } from 'react-icons/tb';
import { MdTextFields } from "react-icons/md";

export class NavOption {
    useStyle: () => {
        classes: Record<'className', string>;
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
        cssFunc?: (theme: MantineTheme) => CSSObject,
    ) {
        this.useStyle = createStyles((theme) => ({
            className: cssFunc ? cssFunc(theme) : {}
        }));
    }
}

export const NavOptionList = [
    new NavOption('Home', '/', TbHome),
    new NavOption('Trainers', '/trainers', BiIdCard),
    new NavOption('Pokemon', '/pokemon', TbPokeball, () => ({
        '&:hover .mantine-ThemeIcon-root > svg': {
            transform: 'rotate(60deg)'
        }
    })),
    new NavOption('Items', '/items', TbBackpack),
    new NavOption('Wallet', '/wallet', TbWallet),
    new NavOption('Word Counter', '/word-counter', MdTextFields),
    new NavOption('Settings', '/settings', GiPokecog, () => ({
        marginTop: 'auto',
        '&:hover': {
            '& .mantine-ThemeIcon-root > svg': {
                transform: 'rotate(120deg)'
            }
        }
    })),
    new NavOption('Data', '/data', TbDatabase)
];
