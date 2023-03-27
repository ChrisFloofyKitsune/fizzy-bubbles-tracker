import { NextPage } from "next";
import {
  useDebouncedRepoSave,
  useRepositories,
  waitForTransactions,
} from "~/services";
import { BondLog, BondStylingConfig, Pokemon } from "~/orm/entities";
import { useListState } from "@mantine/hooks";
import { useAsyncEffect } from "use-async-effect";
import { Repository } from "typeorm";
import {
  createStyles,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { AccordionSpoiler, BBCodeArea, EditModeToggle } from "~/components";
import React, { useCallback, useMemo, useState } from "react";
import { DataTableProps, PropConfig } from "~/components/dataTable/dataTable";
import {
  createNumberPropConfig,
  createSelectPropConfig,
} from "~/components/dataTable/configCreators";
import { css } from "@emotion/react";
import { LocalDate, ZoneId } from "@js-joda/core";
import { useBondInfos } from "~/page-components/bond/use-bond-infos";
import { LogDataTable } from "~/components/dataTable/logDataTable";
import { BondSummary2 } from "~/page-components/bond/bond-summary-2";
import { EditBondModalSaveCallback } from "~/page-components/bond/edit-bond-modal";

const useDataTableStyles = createStyles({
  value: {
    maxWidth: "2em",
  },
  pokemon: {
    minWidth: "10em",
  },
  sourceUrl: {
    maxWidth: "15em",
  },
});

const BondPage: NextPage = () => {
  const [bondConfigRepo, bondRepo, pokemonRepo] = useRepositories(
    BondStylingConfig,
    BondLog,
    Pokemon
  ) as [
    Repository<BondStylingConfig>,
    Repository<BondLog>,
    Repository<Pokemon>
  ];

  const [bondLogs, bondLogsHandler] = useListState<BondLog>([]);
  const [bondConfigs, bondConfigsHandler] = useListState<BondStylingConfig>([]);
  const [pokemonList, pokemonListHandler] = useListState<
    Pick<Pokemon, "uuid" | "name" | "species">
  >([]);

  useAsyncEffect(async () => {
    if (!bondConfigRepo || !bondRepo || !pokemonRepo) return;
    await waitForTransactions(bondRepo);
    bondLogsHandler.setState(
      await bondRepo.find({ loadEagerRelations: false })
    );

    await waitForTransactions(pokemonRepo);
    const pkmList: typeof pokemonList = await pokemonRepo.find({
      select: ["uuid", "name", "species"],
      loadEagerRelations: false,
    });
    pokemonListHandler.setState(pkmList);

    await waitForTransactions(bondConfigRepo);
    const bndConfigs = await bondConfigRepo.find();
    const tempConfigs = pkmList
      .filter((p) => bndConfigs.every((b) => b.pokemonUuid !== p.uuid))
      .map((p) => bondConfigRepo.create({ pokemonUuid: p.uuid }));

    bondConfigsHandler.setState(bndConfigs.concat(tempConfigs));
  }, [bondConfigRepo, pokemonRepo]);

  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  const [bondInfos, updateInfoConfig, updateInfoLogs] = useBondInfos(
    pokemonList,
    bondConfigs,
    bondLogs
  );

  const dataTablePropConfig: PropConfig<BondLog> = useMemo(
    () => ({
      value: createNumberPropConfig("value", "Change", 0),
      pokemonUuid: createSelectPropConfig(
        pokemonList.map((pkm) => ({
          value: pkm.uuid,
          label: `${pkm.name || "(Unnamed)"} the ${
            pkm.species || "(Unknown Pokemon)"
          }`,
        })),
        "pokemonUuid",
        "Pokemon",
        1
      ),
    }),
    [pokemonList]
  );

  const saveBondLog = useDebouncedRepoSave(bondRepo);

  const dataTableConfig: Omit<DataTableProps<BondLog>, "rowObjs"> = useMemo(
    () => ({
      rowObjToId: (log) => log.id,
      propConfig: dataTablePropConfig,
      add: async () => {
        bondLogsHandler.append(
          await bondRepo.save(
            bondRepo.create({
              value: 0,
              pokemonUuid: pokemonList[0].uuid,
              date: LocalDate.now(ZoneId.UTC),
            })
          )
        );
      },
      edit: async (log, prop, value) => {
        const index = bondLogs.indexOf(log);
        bondLogsHandler.setItemProp(index, prop, value);
        saveBondLog(log, { [prop]: value });
      },
      remove: async (log) => {
        bondLogsHandler.filter((l) => l.id !== log.id);
        await bondRepo.remove(log);
      },
    }),
    [
      bondLogs,
      bondLogsHandler,
      bondRepo,
      dataTablePropConfig,
      pokemonList,
      saveBondLog,
    ]
  );

  const dataTableStyles = useDataTableStyles();

  const onModalSaveChanges: EditBondModalSaveCallback = useCallback(
    async (bondConfig, bondLogsToSave, bondLogsToRemove) => {
      const savedBondConfig = await bondConfigRepo.save(bondConfig);
      bondConfigsHandler.setState((prevState) => {
        const prevIndex = prevState.findIndex(
          (c) => c.pokemonUuid === bondConfig.pokemonUuid
        );
        prevState[prevIndex] = savedBondConfig;
        return Array.from(prevState);
      });
      updateInfoConfig(savedBondConfig);

      const removedLogs = await bondRepo.remove(bondLogsToRemove);
      const savedLogs = await bondRepo.save(bondLogsToSave);

      bondLogsHandler.setState((prevState) => {
        if (removedLogs.length > 0) {
          prevState = prevState.filter((l) =>
            removedLogs.some((removed) => removed.id !== l.id)
          );
        }

        for (const savedLog of savedLogs) {
          const existingIndex = prevState.findIndex(
            (l) => l.id === savedLog.id
          );
          if (existingIndex === -1) {
            prevState.push(savedLog);
          } else {
            prevState[existingIndex] = Object.assign(
              new BondLog(),
              prevState[existingIndex],
              savedLog
            );
          }
        }

        return Array.from(prevState);
      });

      updateInfoLogs(savedBondConfig.pokemonUuid, savedLogs);
    },
    [bondConfigRepo, bondRepo, updateInfoConfig, updateInfoLogs]
  );

  if (!bondConfigRepo || !bondRepo || !pokemonRepo) return <>Loading...</>;

  return (
    <>
      <Stack>
        <Group
          pos="relative"
          position="center"
          sx={{
            alignContent: "center",
          }}
        >
          <Title order={2} align="center">
            Bond
          </Title>
          <div
            css={css`
              position: absolute;
              right: 0;
            `}
          >
            <EditModeToggle checked={editModeOn} onToggle={setEditModeOn} />
          </div>
        </Group>
        <Title order={3} mb={"0.5em"}>
          Summary
        </Title>
        <BondSummary2
          bondInfos={bondInfos}
          isEditMode={editModeOn}
          onSave={onModalSaveChanges}
        />
        <AccordionSpoiler label={<Title order={3}>Detail</Title>}>
          <Paper
            sx={(theme) => ({
              borderRadius: "0.5em",
              border: "1px solid " + theme.colors.gray[7],
              backgroundColor: theme.fn.darken(theme.colors.gray[9], 0.2),
              overflow: "clip",
            })}
          >
            <ScrollArea.Autosize maxHeight="40vh">
              <LogDataTable
                rowObjs={bondLogs}
                isShopLog={true}
                isEditMode={editModeOn}
                propsToMantineClasses={dataTableStyles.classes}
                {...dataTableConfig}
              />
            </ScrollArea.Autosize>
          </Paper>
        </AccordionSpoiler>
        <Title order={3}>Output</Title>
        <BBCodeArea
          label="Bond Output"
          bbCode={Object.fromEntries(
            bondInfos
              .filter((output) => output.hasBBCodeOutput)
              .map((output) => [
                output.pokemon.uuid,
                output.getOutput() ?? "something went wrong",
              ])
          )}
        />
      </Stack>
    </>
  );
};

export default BondPage;
