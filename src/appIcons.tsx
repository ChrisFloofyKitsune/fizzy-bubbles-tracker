import { RiAddCircleFill } from "react-icons/ri";
import { VscSaveAll } from "react-icons/vsc";
import { GiCancel } from "react-icons/gi";
import { TiDocumentDelete, TiWarningOutline } from "react-icons/ti";
import { GenIcon, IconBaseProps, IconType } from "react-icons/lib";
import { TbEdit } from "react-icons/tb";
import { createIconTreeFromSVG } from "react-icons-converter";

export const defaultSize = 20;

function wrap(Icon: IconType): IconType {
  return (props: IconBaseProps) => {
    if (!props.size) {
      props = Object.assign({ size: defaultSize }, props);
    }
    return Icon(props);
  };
}

// Source: https://commons.wikimedia.org/wiki/File:Pok%C3%A9mon_Dollar_sign.svg
const PokeDollarSVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="m18.75 61h-5v10h5v6h-5v10h5v13h10v-13h38v-10h-38v-6h38v-10h-38v-6h30c15.188 0 27.5-12.312 27.5-27.5s-12.312-27.5-27.5-27.5h-40c-0.50637 24.995 0 47.667 0 61zm10-16h30c9.665 0 17.5-7.835 17.5-17.5s-7.835-17.5-17.5-17.5h-30z" fill-rule="evenodd"/></svg>`;

export const AddIcon = wrap(RiAddCircleFill);
export const DeleteIcon = wrap(TiDocumentDelete);
export const CancelIcon = wrap(GiCancel);
export const SaveIcon = wrap(VscSaveAll);
export const EditIcon = wrap(TbEdit);
export const WarningIcon = wrap(TiWarningOutline);
export const PokeDollarIcon = wrap(
  GenIcon(createIconTreeFromSVG(PokeDollarSVG, false))
);
