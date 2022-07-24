import { ReactNode, useRef, useCallback, ChangeEvent, Ref, useEffect, MutableRefObject } from 'react';
import { ObjectLiteral, Repository } from 'typeorm';
import { Divider } from '@mantine/core';
import { debounce } from '~/util';

type EntityCallback<T extends ObjectLiteral> = (entity: T) => void;
type InputPropMap<T extends ObjectLiteral> = {
    [P in keyof T]: {
        ref: MutableRefObject<any>;
        onChange: (event: ChangeEvent<{value: any}>) => void;
    }
}

export type EditorWrapperProps<T extends ObjectLiteral> = {
    entityId: any,
    targetEntity: T,
    entityRepo: Repository<T>,
    
    onAdd?: EntityCallback<T>,
    onUpdate?: EntityCallback<T>,
    onConfirmedDelete?: EntityCallback<T>, 
    confirmDeletePlaceholder?: string
 
    children: (inputPropMap: InputPropMap<T>) => ReactNode
}
export function EntityEditor<T extends ObjectLiteral>({
    entityId,
    targetEntity,
    entityRepo,

    onAdd,
    onUpdate,
    onConfirmedDelete,
    confirmDeletePlaceholder = 'DELETE',

    children
}: EditorWrapperProps<T>) {
    const targetKeys = Object.keys(targetEntity);

    const pendingChanges = useRef<Partial<T>>({})

    const debouncedUpdate = useCallback(debounce((c: Partial<T>) => {
        const updatedEntity = Object.assign({}, targetEntity, c);
        onUpdate?.(updatedEntity);
        pendingChanges.current = {};
        entityRepo.save(updatedEntity).then()
    }, 500), [entityId]);

    const update = useCallback((updatePayload: Partial<T>) => {
        const changes = Object.assign(pendingChanges.current, updatePayload);
        debouncedUpdate(changes);
    }, [entityId]);

    const inputPropMap = Object.assign.call(
        Object,
        {},
        ...targetKeys.map(k => ({
            [k]: {
                ref: useRef<any>(),
                onChange: (event: ChangeEvent<{ value: any }>) => {
                    update({ [k]: event.currentTarget.value } as Partial<T>)
                }
            }
        }))
    ) as InputPropMap<T>

    useEffect(() => {
        if (!targetEntity) return;
        for (const [key, {ref}]  of Object.entries(inputPropMap)) {
            if (ref.current) {
                ref.current.value = targetEntity[key];
            }
        }
    }, [entityId])
    
    return <>
        EDITOR STUFF HERE AAAAAA
        <Divider size='md'/>
        {children(inputPropMap)}
    </>
}