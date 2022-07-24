import { ReactNode, useRef, useCallback, ChangeEvent, useEffect, MutableRefObject, useState } from 'react';
import { ObjectLiteral, Repository } from 'typeorm';
import { ActionIcon, Button, Center, Divider, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';

import { debounce } from '~/util';

type EntityCallback<T extends ObjectLiteral> = (entity: T) => void;
type InputPropMap<T extends ObjectLiteral> = {
    [P in keyof T]: {
        ref: MutableRefObject<any>;
        onChange: (event: ChangeEvent<{ value: any }>) => void;
    }
}

import { AddIcon, CancelIcon, DeleteIcon, WarningIcon } from '~/appIcons';
import { waitUntil } from 'async-wait-until';

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
        for (const [key, { ref }] of Object.entries(inputPropMap)) {
            if (ref.current) {
                ref.current.value = targetEntity[key];
            }
        }
    }, [entityId])

    const [modalOpened, setModalOpened] = useState<boolean>(false);
    const [deleteText, setDeleteText] = useState<string>('');
    const [deletePending, setDeletePending] = useState<boolean>(false);

    return <>
        <Modal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            withCloseButton={false}
            centered={true}
            overlayColor='#550000bb'
            radius='md'
            size='50%'
            title={
                <Group
                    sx={{
                        flexWrap: 'nowrap'
                    }}
                >
                    <Title
                        order={1}
                        sx={theme => ({
                            backgroundColor: theme.fn.darken(theme.colors.red[9], 0.5),
                            width: '100%',
                            color: 'whitesmoke',
                            padding: '0.25em 0.3em',
                            borderRadius: '0.5em'
                        })}
                        align='center'
                    >
                        CONFIRM DELETION
                    </Title>
                    <ActionIcon
                        variant='filled'
                        color='orange'
                        size='xl'
                        radius='xl'
                        onClick={() => setModalOpened(false)}
                    >
                        <CancelIcon size='32px' />
                    </ActionIcon>
                </Group>
            }
        >
            <Stack>
                <Center>
                    <Text
                        align='center'
                    >
                        Type "
                        <Text sx={theme => ({
                            fontWeight: 'bolder',
                            display: 'inline',
                            color: theme.colors.red[9]
                        })}>
                            {confirmDeletePlaceholder}
                        </Text>
                        " to be able to confirm deletion.
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
                    leftIcon={<WarningIcon />}
                    rightIcon={<WarningIcon />}
                    disabled={deleteText !== confirmDeletePlaceholder || deletePending}
                    onClick={async () => {
                        onConfirmedDelete?.(targetEntity);
                        setDeletePending(true);
                        await waitUntil(() => !entityRepo.queryRunner?.isTransactionActive);
                        await entityRepo.remove(targetEntity);
                        setDeletePending(false);
                        setDeleteText('');
                        setModalOpened(false);
                    }}
                >
                    <strong>DELETE</strong>
                </Button>
            </Stack>
        </Modal>

        <Group>
            <Button
                color='green'
                leftIcon={<AddIcon />}
            >
                {`Create New ${entityRepo.metadata.name}`}
            </Button>
            <Button
                ml='auto'
                color='red'
                leftIcon={<DeleteIcon />}
                onClick={() => setModalOpened(true)}
            >
                {`Delete${targetEntity.name ? ` ${targetEntity.name}` : ''}`}
            </Button>
        </Group>
        <Divider size='sm' />
        {children(inputPropMap)}
    </>
}