import { ContextModalProps, openContextModal } from "@mantine/modals";
import { BondLog, BondStylingConfig } from "~/orm/entities";
import {
  Button,
  createStyles,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { ModalName } from "~/modalsList";
import { AccordionSpoiler, AvatarIconImage } from "~/components";
import { DataTableProps } from "~/components/dataTable/dataTable";
import { useMemo, useState } from "react";
import { LocalDate, ZoneId } from "@js-joda/core";
import { createNumberPropConfig } from "~/components/dataTable/configCreators";
import { useListState } from "@mantine/hooks";
import { LogDataTable } from "~/components/dataTable/logDataTable";
import { CancelIcon, SaveIcon } from "~/appIcons";

const useDataTableStyles = createStyles({
  value: {
    maxWidth: "2em",
  },
  sourceUrl: {
    maxWidth: "15em",
  },
});

export type EditBondModalSaveCallback = (
  bondConfig: BondStylingConfig,
  bondLogsToSave: BondLog[],
  bondLogsToRemove: BondLog[]
) => Promise<void>;

export type EditBondModalContext = {
  pokemonUuid: string;
  bondStylingConfig: BondStylingConfig;
  bondLogs: BondLog[];
  logsToRemove: BondLog[];
  onSave: EditBondModalSaveCallback;
};

export function EditBondModal({
  context,
  id: modalId,
  innerProps: props,
}: ContextModalProps<EditBondModalContext>) {
  const [pendingBondConfig, setPendingBondConfig] = useState<BondStylingConfig>(
    Object.assign(new BondStylingConfig(), {
      ...props.bondStylingConfig,
    })
  );

  const [pendingBondLogs, pendingBondLogsHandler] = useListState<BondLog>(
    props.bondLogs.map((l) =>
      Object.assign(new BondLog(), {
        ...l,
        pokemonUuid: props.pokemonUuid,
        date: LocalDate.from(l.date),
      })
    )
  );

  const dataTableConfig: Omit<DataTableProps<BondLog>, "rowObjs"> = useMemo(
    () => ({
      rowObjToId: (log) => log.id,
      propConfig: {
        value: createNumberPropConfig("value", "Change", 0),
      },
      add: async () => {
        pendingBondLogsHandler.append(
          Object.assign(new BondLog(), {
            value: 0,
            pokemonUuid: props.pokemonUuid,
            date: LocalDate.now(ZoneId.UTC),
          })
        );
      },
      edit: async (log, prop, value) => {
        const index = pendingBondLogs.indexOf(log);
        pendingBondLogsHandler.setItemProp(index, prop, value);
      },
      remove: async (log) => {
        props.bondStylingConfig = pendingBondConfig;
        props.bondLogs = pendingBondLogs.filter((l) => l.id !== log.id);
        props.logsToRemove.push(log);
      },
    }),
    [pendingBondConfig, pendingBondLogs, props]
  );

  const dataTableStyles = useDataTableStyles();

  return (
    <Stack>
      <Stack>
        <TextInput
          label="Color Code"
          placeholder="CSS Color (#RRGGBB or named color)"
          value={pendingBondConfig.colorCode ?? ""}
          onChange={(event) =>
            setPendingBondConfig((prev) =>
              Object.assign(new BondStylingConfig(), prev, {
                colorCode: event.currentTarget.value,
              })
            )
          }
        />
        <Group>
          <AvatarIconImage imageLink={pendingBondConfig.iconImageLink} />
          <TextInput
            label="Sprite Icon Link"
            placeholder="(image link here)"
            sx={{ flexGrow: 1 }}
            value={pendingBondConfig.iconImageLink ?? ""}
            onChange={(event) =>
              setPendingBondConfig((prev) =>
                Object.assign(new BondStylingConfig(), prev, {
                  iconImageLink: event.currentTarget.value,
                })
              )
            }
          />
        </Group>
        <AccordionSpoiler label="Extra BBCode Settings">
          <Group>
            <Textarea
              label="Pre-Header BBCode"
              sx={{ flexGrow: 1 }}
              value={pendingBondConfig.preHeaderBBCode ?? ""}
              onChange={(event) =>
                setPendingBondConfig((prev) =>
                  Object.assign(new BondStylingConfig(), prev, {
                    preHeaderBBCode: event.currentTarget.value,
                  })
                )
              }
            />
            <Textarea
              label="Post-Header BBCode"
              sx={{ flexGrow: 1 }}
              value={pendingBondConfig.postHeaderBBCode ?? ""}
              onChange={(event) =>
                setPendingBondConfig((prev) =>
                  Object.assign(new BondStylingConfig(), prev, {
                    postHeaderBBCode: event.currentTarget.value,
                  })
                )
              }
            />
          </Group>
          <Group>
            <Textarea
              label="Pre-Footer BBCode"
              sx={{ flexGrow: 1 }}
              value={pendingBondConfig.preFooterBBCode ?? ""}
              onChange={(event) =>
                setPendingBondConfig((prev) =>
                  Object.assign(new BondStylingConfig(), prev, {
                    preFooterBBCode: event.currentTarget.value,
                  })
                )
              }
            />
            <Textarea
              label="Post-Footer BBCode"
              sx={{ flexGrow: 1 }}
              value={pendingBondConfig.postFooterBBCode ?? ""}
              onChange={(event) =>
                setPendingBondConfig((prev) =>
                  Object.assign(new BondStylingConfig(), prev, {
                    postFooterBBCode: event.currentTarget.value,
                  })
                )
              }
            />
          </Group>
        </AccordionSpoiler>
      </Stack>
      <Divider />
      <ScrollArea.Autosize
        maxHeight="50vh"
        sx={(theme) => ({
          borderRadius: "0.25em",
          overflow: "clip",
          border: "1px solid " + theme.colors.dark[4],
        })}
      >
        <LogDataTable
          rowObjs={pendingBondLogs}
          isShopLog={true}
          isEditMode={true}
          propsToMantineClasses={dataTableStyles.classes}
          {...dataTableConfig}
        />
      </ScrollArea.Autosize>

      <Group position="right">
        <Button
          variant="outline"
          color="yellow"
          onClick={() => context.closeModal(modalId)}
          leftIcon={<CancelIcon />}
        >
          Cancel
        </Button>
        <Button
          color="green"
          onClick={async () => {
            await props.onSave(
              pendingBondConfig,
              pendingBondLogs,
              props.logsToRemove
            );
            context.closeModal(modalId);
          }}
          leftIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}

export function OpenEditBondModal(
  innerProps: Omit<EditBondModalContext, "logsToRemove">
): void {
  openContextModal({
    modal: ModalName.EditBondConfig,
    title: <Title order={2}>Edit Bond / Bond Output Styling</Title>,
    size: "80vw",
    innerProps: { ...innerProps, logsToRemove: [] } as EditBondModalContext,
    centered: true,
    trapFocus: false,
    withFocusReturn: false,
    closeOnClickOutside: false,
  });
}
