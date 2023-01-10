import {
  ChangeEvent,
  createRef,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ObjectLiteral, Repository } from "typeorm";
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { AddIcon, CancelIcon, DeleteIcon, WarningIcon } from "~/appIcons";
import { waitUntil } from "async-wait-until";
import { useDebouncedRepoSave } from "~/services";

type EntityCallback<T extends ObjectLiteral> = (entity: T) => void;
export type InputRef = RefObject<{ value: any } | any>;
type Change =
  | ChangeEvent<{ value: any }>
  | ChangeEvent<{ checked: boolean }>
  | object[]
  | object
  | string
  | boolean
  | number
  | null;
type InputPropMap<T extends Required<ObjectLiteral>> = {
  [P in keyof T]: {
    ref: InputRef;
    onChange: (event: Change) => void;
  };
};

export type EditorWrapperProps<T extends ObjectLiteral> = {
  targetEntity: T;
  entityRepo: Repository<T>;
  resolveValueHelper?: (entity: T, key: keyof T) => string | number | void;

  createNewEntity?: () => T | null;
  onAdd?: EntityCallback<T>;
  onUpdate?: EntityCallback<T[]>;
  allowDelete?: boolean;
  onConfirmedDelete?: EntityCallback<T>;
  confirmDeletePlaceholder?: string;

  extraHeaderElement?: JSX.Element;
  children: (inputPropMap: InputPropMap<T>) => ReactNode;
  entityLabel?: string;
};

export function EntityEditor<T extends ObjectLiteral>({
  targetEntity,
  entityRepo,
  resolveValueHelper,

  createNewEntity,
  onAdd,
  onUpdate,
  allowDelete = true,
  onConfirmedDelete,
  confirmDeletePlaceholder = "DELETE",

  extraHeaderElement = <></>,
  entityLabel,
  children,
}: EditorWrapperProps<T>) {
  const targetKeys = useMemo(() => Object.keys(targetEntity), [targetEntity]);

  const saveChange = useDebouncedRepoSave(entityRepo, {
    beforeSavedToRepo: (updatedEntity) => {
      console.debug("Saving Entity to repo...", updatedEntity);
      onUpdate?.(updatedEntity);
    },
    debounceTime: 1000,
  });

  const refMap = useRef<Record<string, InputRef>>({});

  const inputPropMap = useMemo(
    () =>
      Object.assign(
        {},
        ...targetKeys.map((k) => {
          let ref = refMap.current[k];
          if (!ref) {
            ref = refMap.current[k] = createRef();
          }

          return {
            [k]: {
              ref,
              onChange: (eventOrValue: Change) => {
                // unpack ChangeEvent<value | checked> objects.
                if (isChangeEvent(eventOrValue)) {
                  if (
                    typeof (eventOrValue.currentTarget as { value: any })
                      .value !== "undefined"
                  ) {
                    eventOrValue = (
                      eventOrValue.currentTarget as { value: any }
                    ).value;
                  } else {
                    eventOrValue = (
                      eventOrValue.currentTarget as { checked: boolean }
                    ).checked;
                  }
                }
                console.debug(`${k} changed to`, eventOrValue);
                saveChange(targetEntity, { [k]: eventOrValue } as Partial<T>);
              },
            },
          };
        })
      ) as InputPropMap<T>,
    [targetKeys, saveChange, targetEntity]
  );

  useEffect(() => {
    if (!targetEntity) return;
    for (const [key, { ref }] of Object.entries(inputPropMap)) {
      if (ref.current) {
        ref.current.value =
          resolveValueHelper?.(targetEntity, key) ?? targetEntity[key];
      }
    }
  }, [inputPropMap, targetEntity, resolveValueHelper]);

  const addNew = useCallback(async () => {
    let newEntity =
      typeof createNewEntity !== "undefined"
        ? createNewEntity()
        : entityRepo.create();
    if (newEntity === null) return;

    newEntity = await entityRepo.save(newEntity);
    onAdd?.(newEntity);
  }, [entityRepo, createNewEntity, onAdd]);

  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [deleteText, setDeleteText] = useState<string>("");
  const [deletePending, setDeletePending] = useState<boolean>(false);

  const deleteEntity = useCallback(async () => {
    onConfirmedDelete?.(targetEntity);
    setDeletePending(true);
    await waitUntil(() => !entityRepo.queryRunner?.isTransactionActive);
    await entityRepo.remove(targetEntity);
    setDeletePending(false);
    setDeleteText("");
    setModalOpened(false);
  }, [targetEntity, entityRepo, onConfirmedDelete]);

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        withCloseButton={false}
        centered={true}
        overlayColor="#550000bb"
        radius="md"
        styles={{
          inner: { minWidth: "325px" },
          modal: { width: "max(310px, min(90%, 30em))" },
          header: { width: "100%" },
          title: { width: "100%", margin: "0" },
        }}
        title={
          <Group
            sx={{
              flexWrap: "nowrap",
              justifyContent: "space-between",
            }}
          >
            <Title
              order={1}
              sx={(theme) => ({
                backgroundColor: theme.fn.darken(theme.colors.red[9], 0.5),
                width: "100%",
                color: "whitesmoke",
                padding: "0.25em 0.3em",
                borderRadius: "0.5em",
              })}
              align="center"
            >
              CONFIRM DELETION
            </Title>
            <ActionIcon
              variant="filled"
              color="orange"
              size={54}
              radius="xl"
              onClick={() => setModalOpened(false)}
            >
              <CancelIcon size="32px" />
            </ActionIcon>
          </Group>
        }
      >
        <Stack>
          <Center>
            <Text align="center">
              Type
              <Text
                sx={(theme) => ({
                  fontWeight: "bolder",
                  display: "inline",
                  color: theme.colors.red[9],
                })}
              >
                {` "${confirmDeletePlaceholder}" `}
              </Text>
              to be able to confirm deletion.
            </Text>
          </Center>
          <TextInput
            value={deleteText}
            onChange={(event) => setDeleteText(event.currentTarget.value)}
            placeholder={confirmDeletePlaceholder}
          />
          <Center>{`This cannot be undone!`}</Center>
          <Button
            color="red"
            leftIcon={<WarningIcon />}
            rightIcon={<WarningIcon />}
            disabled={deleteText !== confirmDeletePlaceholder || deletePending}
            onClick={deleteEntity}
          >
            <strong>DELETE</strong>
          </Button>
        </Stack>
      </Modal>

      <Group noWrap>
        <Button color="green" leftIcon={<AddIcon />} onClick={addNew}>
          {`Create New ${entityLabel ?? entityRepo.metadata.name}`}
        </Button>
        {extraHeaderElement}
        <Button
          ml="auto"
          color="red"
          leftIcon={<DeleteIcon />}
          disabled={!allowDelete}
          onClick={() => setModalOpened(true)}
        >
          {`Delete${targetEntity.name ? ` ${targetEntity.name}` : ""}`}
        </Button>
      </Group>
      <Divider size="sm" />
      {children(inputPropMap)}
    </>
  );
}

function isChangeEvent(
  value: any
): value is ChangeEvent<{ value: any } | { checked: boolean }> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.hasOwn(value, "currentTarget")
  );
}
