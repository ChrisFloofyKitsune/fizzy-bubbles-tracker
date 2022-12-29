import { RiAddCircleFill } from "react-icons/ri";
import { VscSaveAll } from "react-icons/vsc";
import { GiCancel } from "react-icons/gi";
import { TiDocumentDelete, TiWarningOutline } from "react-icons/ti";
import { GenIcon, IconBaseProps, IconType } from "react-icons/lib";
import { TbEdit, TbEye } from "react-icons/tb";
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
const PokeDexSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.5 0h-15c-0.27637 0-0.5 0.22363-0.5 0.5v23c0 0.27637 0.22363 0.5 0.5 0.5h15c0.27637 0 0.5-0.22363 0.5-0.5v-23c0-0.27637-0.22363-0.5-0.5-0.5zm-1.5 22h-2v-13h-1.2573c-0.66748 0-1.2954 0.25977-1.7681 0.73242l-1.2422 1.2422c-0.66162 0.66113-1.5405 1.0254-2.4751 1.0254h-3.2573v-2h3.2573c0.66748 0 1.2954-0.25977 1.7681-0.73242l1.2422-1.2422c0.66162-0.66113 1.5405-1.0254 2.4751-1.0254h3.2573zm-12-1.3357v-5.3427c0-0.54001 0.41425-1.097 0.82436-1.2339 0.41214-0.13228 1.1326-0.13956 1.4556 0.28957l2.6714 2.6714c0.48141 0.48141 0.51105 1.3777 0 1.8888l-2.6714 2.6714c-0.25807 0.25807-0.5974 0.39131-0.94436 0.39131-0.17217 0-0.34798-0.032107-0.51132-0.10174-0.49251-0.21156-0.82436-0.61589-0.82436-1.2339zm5.3554-15.987c0 1.4761-1.2009 2.6777-2.6777 2.6777-1.4768 0-2.6777-1.2016-2.6777-2.6777s1.2009-2.6777 2.6777-2.6777c1.4768 0 2.6777 1.2016 2.6777 2.6777z"/></svg>`;

export const AddIcon = wrap(RiAddCircleFill);
export const DeleteIcon = wrap(TiDocumentDelete);
export const CancelIcon = wrap(GiCancel);
export const SaveIcon = wrap(VscSaveAll);
export const EditIcon = wrap(TbEdit);
export const WarningIcon = wrap(TiWarningOutline);
export const PokeDollarIcon = wrap(
  GenIcon(createIconTreeFromSVG(PokeDollarSVG, false))
);
export const ViewIcon = wrap(TbEye);
export const PokeDexIcon = wrap(
  GenIcon(createIconTreeFromSVG(PokeDexSVG, false))
);
