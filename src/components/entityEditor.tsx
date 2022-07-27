import {ChangeEvent, createRef, ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ObjectLiteral, Repository} from 'typeorm';
import {ActionIcon, Button, Center, Divider, Group, Modal, Stack, Text, TextInput, Title} from '@mantine/core';

import {debounce} from '~/util';
import {AddIcon, CancelIcon, DeleteIcon, WarningIcon} from '~/appIcons';
import {waitUntil} from 'async-wait-until';

type EntityCallback<T extends ObjectLiteral> = (entity: T) => void;
export type InputRef = RefObject<{ value: any } | any>
type Change = ChangeEvent<{ value: any }> | ChangeEvent<{ checked: boolean }> | object[] | string | boolean | number | null;
type InputPropMap<T extends ObjectLiteral> = {
    [P in keyof T]: {
        ref: InputRef;
        onChange: (event: Change) => void;
    }
}

export type EditorWrapperProps<T extends ObjectLiteral> = {
    entityId: any,
    targetEntity: T,
    entityRepo: Repository<T>,
    resolveValueHelper?: (entity: T, key: keyof T) => string | number | void,

    createNewEntity?: () => T;
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
    resolveValueHelper,

    createNewEntity,
    onAdd,
    onUpdate,
    onConfirmedDelete,
    confirmDeletePlaceholder = 'DELETE',

    children
}: EditorWrapperProps<T>) {
    const targetKeys = useMemo(() => Object.keys(targetEntity), [targetEntity]);
    const [blankEntity, setBlankEntity] = useState<T>();
    const pendingChanges = useRef<Partial<T>>({});

    useEffect(() => {
        pendingChanges.current = {};
    }, [entityId, targetEntity]);

    useEffect(() => {
        setBlankEntity(entityRepo.create());
    }, [entityRepo]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdate = useCallback(debounce((c: Partial<T>) => {
        const updatedEntity = Object.assign(Object.create(blankEntity ?? {}), targetEntity, c);
        console.debug('updating:', JSON.stringify(updatedEntity));
        onUpdate?.(updatedEntity);
        pendingChanges.current = {};
        entityRepo.save(updatedEntity).then();
    }, 500), [blankEntity, targetEntity, entityId]);

    const update = useCallback((updatePayload: Partial<T>) => {
        const changes = Object.assign(pendingChanges.current, updatePayload);
        debouncedUpdate(changes);
    }, [debouncedUpdate]);

    const refMap = useRef<Record<string, InputRef>>({});

    const inputPropMap = useMemo(() => Object.assign.call(
        Object,
        {},
        ...targetKeys.map(k => {
            let ref = refMap.current[k];
            if (!ref) {
                ref = refMap.current[k] = createRef();
            }

            return {
                [k]: {
                    ref,
                    onChange: (eventOrValue: Change) => {
                        // unpack ChangeEvent<value | checked> objects.
                        if (!Array.isArray(eventOrValue) && typeof eventOrValue === 'object' && eventOrValue?.currentTarget) {
                            if (typeof (eventOrValue.currentTarget as {value: any}).value !== 'undefined') {
                                eventOrValue = (eventOrValue.currentTarget as {value: any}).value;
                            } else {
                                eventOrValue = (eventOrValue.currentTarget as {checked: boolean}).checked;
                            }
                        }
                        update({[k]: eventOrValue} as Partial<T>);
                    }
                }
            };
        })
    ) as InputPropMap<T>, [targetKeys, update]);

    useEffect(() => {
        if (!targetEntity) return;
        for (const [key, {ref}] of Object.entries(inputPropMap)) {
            if (ref.current) {
                ref.current.value = resolveValueHelper?.(targetEntity, key) ?? targetEntity[key];
            }
        }
    }, [inputPropMap, targetEntity, entityId, resolveValueHelper]);

    const addNew = useCallback(async () => {
        let newEntity = createNewEntity?.() ?? entityRepo.create();
        newEntity = await entityRepo.save(newEntity);
        onAdd?.(newEntity);
    }, [entityRepo, createNewEntity, onAdd]);

    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [deleteText, setDeleteText] = useState<string>('');
    const [deletePending, setDeletePending] = useState<boolean>(false);

    const deleteEntity = useCallback(async () => {
        onConfirmedDelete?.(targetEntity);
        setDeletePending(true);
        await waitUntil(() => !entityRepo.queryRunner?.isTransactionActive);
        await entityRepo.remove(targetEntity);
        setDeletePending(false);
        setDeleteText('');
        setModalOpened(false);
    }, [targetEntity, entityRepo, onConfirmedDelete]);

    return <>
        <Modal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            withCloseButton={false}
            centered={true}
            overlayColor='#550000bb'
            radius='md'
            styles={{
                inner: { minWidth: '325px' },
                modal: { width: 'max(310px, min(90%, 30em))' },
                header: { width: '100%' },
                title: { width: '100%', margin: '0' }
            }}
            title={
                <Group sx={{
                    flexWrap: 'nowrap',
                    justifyContent: 'space-between',
                }}>
                    <Title
                        order={1}
                        sx={theme => ({
                            backgroundColor: theme.fn.darken(theme.colors.red[9], 0.5),
                            width: '100%',
                            color: 'whitesmoke',
                            padding: '0.25em 0.3em',
                            borderRadius: '0.5em',
                        })}
                        align='center'
                    >
                        CONFIRM DELETION
                    </Title>
                    <ActionIcon
                        variant='filled'
                        color='orange'
                        size='54px'
                        radius='xl'
                        onClick={() => setModalOpened(false)}
                    >
                        <CancelIcon size='32px'/>
                    </ActionIcon>
                </Group>
            }
        >
            <Stack>
                <Center>
                    <Text
                        align='center'
                    >
                        Type
                        <Text sx={theme => ({
                            fontWeight: 'bolder',
                            display: 'inline',
                            color: theme.colors.red[9]
                        })}>
                            {` "${confirmDeletePlaceholder}" `}
                        </Text>
                        to be able to confirm deletion.
                    </Text>
                </Center>
                <TextInput
                    value={deleteText}
                    onChange={event => setDeleteText(event.currentTarget.value)}
                    placeholder={confirmDeletePlaceholder}
                />
                <Center>
                    {`This cannot be undone!`}
                </Center>
                <Button
                    color='red'
                    leftIcon={<WarningIcon/>}
                    rightIcon={<WarningIcon/>}
                    disabled={deleteText !== confirmDeletePlaceholder || deletePending}
                    onClick={deleteEntity}
                >
                    <strong>DELETE</strong>
                </Button>
            </Stack>
        </Modal>

        <Group>
            <Button
                color='green'
                leftIcon={<AddIcon/>}
                onClick={addNew}
            >
                {`Create New ${entityRepo.metadata.name}`}
            </Button>
            <Button
                ml='auto'
                color='red'
                leftIcon={<DeleteIcon/>}
                onClick={() => setModalOpened(true)}
            >
                {`Delete${targetEntity.name ? ` ${targetEntity.name}` : ''}`}
            </Button>
        </Group>
        <Divider size='sm'/>
        {children(inputPropMap)}
    </>;
}