import { RiAddCircleFill } from 'react-icons/ri';
import { VscSaveAll } from 'react-icons/vsc';
import { GiCancel } from 'react-icons/gi';
import { TiDocumentDelete, TiWarningOutline } from 'react-icons/ti';
import { IconBaseProps, IconType } from 'react-icons/lib';
import { TbEdit } from 'react-icons/tb';

export const defaultSize = 20;
function wrap(Icon: IconType): IconType {
    return (props: IconBaseProps) => {
        if (!props.size) {
            props = Object.assign({ size: defaultSize }, props);
        }
        return Icon(props);
    };
}

export const AddIcon = wrap(RiAddCircleFill);
export const DeleteIcon = wrap(TiDocumentDelete);
export const CancelIcon = wrap(GiCancel);
export const SaveIcon = wrap(VscSaveAll);
export const EditIcon = wrap(TbEdit);
export const WarningIcon = wrap(TiWarningOutline);

