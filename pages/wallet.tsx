import {
  Box,
  createStyles,
  CSSObject,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import {
  useDebouncedRepoSave,
  useRepository,
  waitForTransactions,
} from "~/services";
import React, { useCallback, useMemo, useState } from "react";
import { WalletLog } from "~/orm/entities";
import { useAsyncEffect } from "use-async-effect";
import { AccordionSpoiler, BBCodeArea, EditModeToggle } from "~/components";
import { useListState } from "@mantine/hooks";
import { CurrencyType, CurrencyTypeDisplayName } from "~/orm/enums";
import { PokeDollarIcon } from "~/appIcons";
import { TbCandy } from "react-icons/tb";
import { DataTableCallbacks } from "~/components/dataTable/dataTable";
import { createNumberPropConfig } from "~/components/dataTable/configCreators";
import {
  LogDataTable,
  LogDataTableProps,
} from "~/components/dataTable/logDataTable";
import { css } from "@emotion/react";

type Balances = { [p in CurrencyType]: number };

const propStyles = createStyles({
  quantityChange: {
    width: "12em",
  },
} as Record<keyof WalletLog, CSSObject>);

const WalletPage: NextPage = () => {
  const repo = useRepository(WalletLog);
  const [walletLogs, walletLogsHandler] = useListState<WalletLog>([]);
  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitForTransactions(repo);
    walletLogsHandler.setState(await repo.find());
  }, [repo]);

  const currentBalances: Balances = useMemo(() => {
    return walletLogs.reduce((balance, { currencyType, quantityChange }) => {
      balance[currencyType] += quantityChange;
      return balance;
    }, Object.assign({} as Balances, ...Object.values(CurrencyType).map((c) => ({ [c]: 0 }))) as Balances);
  }, [walletLogs]);

  const requestSave = useDebouncedRepoSave(repo);

  const makeCurrencyTypeOptions = useCallback(
    (
      type: CurrencyType
    ): DataTableCallbacks<WalletLog> & { rowObjs: WalletLog[] } => ({
      rowObjs: walletLogs.filter((log) => log.currencyType === type),
      add: async () => {
        const log = await repo!.save(repo!.create({ currencyType: type }));
        walletLogsHandler.append(log);
      },
      edit: async (log, prop, value) => {
        if (typeof prop === "undefined") return;
        const index = walletLogs.findIndex((l) => l.id === log.id);
        walletLogsHandler.setItemProp(index, prop, value);
        requestSave(log, { [prop]: value });
      },
      remove: async (log) => {
        walletLogsHandler.filter((wl) => wl.id !== log.id);
        await repo!.remove(log);
      },
    }),
    [requestSave, walletLogs, walletLogsHandler, repo]
  );

  const currencyTypeOptions: {
    [V in CurrencyType]: DataTableCallbacks<WalletLog> & {
      rowObjs: WalletLog[];
    };
  } = useMemo(() => {
    return Object.assign(
      {},
      ...Object.values(CurrencyType).map((ct) => ({
        [ct]: makeCurrencyTypeOptions(ct),
      }))
    );
  }, [makeCurrencyTypeOptions]);

  const walletLogPropStyles = propStyles();

  const staticDataTableProps: Pick<
    LogDataTableProps<WalletLog>,
    "isShopLog" | "rowObjToId" | "propConfig"
  > = useMemo(() => {
    return {
      isShopLog: true,
      rowObjToId: (log: WalletLog) => log.id,
      propConfig: {
        quantityChange: createNumberPropConfig("quantityChange", "Change", 0),
      },
    };
  }, []);

  const bbcodeOutput = useMemo(
    () =>
      `[size=+1][b]${CurrencyTypeDisplayName.rarecandy[1]}[/b][/size]

${WalletLog.createBBCode(walletLogs, CurrencyType.RARE_CANDY)}

[size=+1][b]${CurrencyTypeDisplayName.pokedollar[1]}[/b][/size]

${WalletLog.createBBCode(walletLogs, CurrencyType.POKE_DOLLAR)}

[size=+1][b]${CurrencyTypeDisplayName.watts[1]}[/b][/size]

${WalletLog.createBBCode(walletLogs, CurrencyType.WATTS)}`,
    [walletLogs]
  );

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
            Wallet
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
        <Title order={3}>Summary</Title>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridAutoFlow: "column",
            gap: "0.25em 1em",
            padding: "0 2rem",
            maxWidth: "60em",
            margin: "auto",
            gridTemplate: "repeat(5, 1fr) / 1fr",
            "& > *": {
              borderBottom: "1px gray solid",
            },
            "& .mantine-Group-root": {
              justifyContent: "space-between",
              gap: "0.5em",
              ".mantine-Text-root:nth-of-type(2)": {
                flexGrow: 3,
                textAlign: "right",
              },
              ".mantine-Text-root:nth-of-type(3)": {
                width: "1.5em",
                height: "1.5em",
                textAlign: "center",
              },
            },
            "& svg": {
              display: "inline",
              verticalAlign: "middle",
              marginTop: "-0.3em",
            },
          }}
        >
          <Group>
            <Title order={4}>Currency</Title>
            <Title order={4} align="right">
              Balance
            </Title>
          </Group>

          <Group>
            <Text>{CurrencyTypeDisplayName["rarecandy"][1]}</Text>
            <Text>
              {`${(currentBalances.rarecandy ?? 0).toLocaleString("en-US")}`}
            </Text>
            <Text>
              <TbCandy size="1.3em" />
            </Text>
          </Group>
          <Group>
            <Text>{CurrencyTypeDisplayName["pokedollar"][1]}</Text>
            <Text>
              {`${(currentBalances.pokedollar ?? 0).toLocaleString("en-US")}`}
            </Text>
            <Text>
              <PokeDollarIcon size="1em" />
            </Text>
          </Group>
          <Group>
            <Text>{CurrencyTypeDisplayName["watts"][1]}</Text>
            <Text>{`${(currentBalances.watts ?? 0).toLocaleString(
              "en-US"
            )}`}</Text>
            <Text weight={500}>LP</Text>
          </Group>
        </Box>

        <Title order={3}>Detail</Title>

        <AccordionSpoiler
          label={
            <Title order={4}>
              {CurrencyTypeDisplayName[CurrencyType.RARE_CANDY][1]}
            </Title>
          }
        >
          <Paper
            m={-10}
            sx={{
              overflow: "clip",
              clipPath: "border-box",
              borderRadius: "0.5em",
              border: "solid 1px dimgray",
            }}
          >
            <ScrollArea.Autosize
              maxHeight="40vh"
              styles={{
                scrollbar: {
                  zIndex: 10,
                },
              }}
            >
              <LogDataTable
                key={`log-data-table-${CurrencyType.RARE_CANDY}`}
                {...staticDataTableProps}
                {...currencyTypeOptions[CurrencyType.RARE_CANDY]}
                isEditMode={editModeOn}
                propsToMantineClasses={walletLogPropStyles.classes}
              />
            </ScrollArea.Autosize>
          </Paper>
        </AccordionSpoiler>

        <AccordionSpoiler
          label={
            <Title order={4}>
              {CurrencyTypeDisplayName[CurrencyType.POKE_DOLLAR][1]}
            </Title>
          }
        >
          <Paper
            m={-10}
            sx={{
              overflow: "clip",
              clipPath: "border-box",
              borderRadius: "0.5em",
              border: "solid 1px dimgray",
            }}
          >
            <ScrollArea.Autosize
              maxHeight="40vh"
              styles={{
                scrollbar: {
                  zIndex: 10,
                },
              }}
            >
              <LogDataTable
                key={`log-data-table-${CurrencyType.POKE_DOLLAR}`}
                {...staticDataTableProps}
                {...currencyTypeOptions[CurrencyType.POKE_DOLLAR]}
                isEditMode={editModeOn}
                propsToMantineClasses={walletLogPropStyles.classes}
              />
            </ScrollArea.Autosize>
          </Paper>
        </AccordionSpoiler>

        <AccordionSpoiler
          label={
            <Title order={4}>
              {CurrencyTypeDisplayName[CurrencyType.WATTS][1]}
            </Title>
          }
        >
          <Paper
            m={-10}
            sx={{
              overflow: "clip",
              clipPath: "border-box",
              borderRadius: "0.5em",
              border: "solid 1px dimgray",
            }}
          >
            <ScrollArea.Autosize
              maxHeight="40vh"
              styles={{
                scrollbar: {
                  zIndex: 10,
                },
              }}
            >
              <LogDataTable
                key={`log-data-table-${CurrencyType.WATTS}`}
                {...staticDataTableProps}
                {...currencyTypeOptions[CurrencyType.WATTS]}
                isEditMode={editModeOn}
                propsToMantineClasses={walletLogPropStyles.classes}
              />
            </ScrollArea.Autosize>
          </Paper>
        </AccordionSpoiler>

        <Title order={3}>Output</Title>
        <Stack>
          <BBCodeArea bbCode={bbcodeOutput} />
        </Stack>
      </Stack>
    </>
  );
};

// noinspection JSUnusedGlobalSymbols
export default WalletPage;
