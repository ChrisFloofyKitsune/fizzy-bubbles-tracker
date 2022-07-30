import {
  Accordion,
  Box,
  createStyles,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { useDataSource } from "~/services";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Repository } from "typeorm";
import { WalletLog } from "~/orm/entities";
import { useAsyncEffect } from "use-async-effect";
import { WAIT_FOREVER, waitUntil } from "async-wait-until";
import { EditModeToggle } from "~/components";
import { useListState } from "@mantine/hooks";
import { CurrencyType } from "~/orm/enums";
import { PokeDollarIcon } from "~/appIcons";
import { TbCandy } from "react-icons/tb";
import {
  LogEditor,
  LogEditorCallbacks,
  PropToEditorComponentPair,
  PropToLabelPair,
} from "~/components/input/logEditor";
import { debounce } from "~/util";
import { numberPropToEditor } from "~/components/input/logEditorNumber";

type Balances = { [p in CurrencyType]: number };

const propStyles = createStyles({
  quantityChange: {
    width: "10em",
  },
});

const Wallet: NextPage = () => {
  const ds = useDataSource();
  useEffect(() => {
    setRepo(ds?.getRepository(WalletLog));
  }, [ds]);

  const [repo, setRepo] = useState<Repository<WalletLog>>();
  const [walletLogs, walletLogsHandler] = useListState<WalletLog>([]);
  const [editModeOn, setEditModeOn] = useState<boolean>(false);

  useAsyncEffect(async () => {
    if (!repo) return;
    await waitUntil(() => !repo.queryRunner?.isTransactionActive, {
      timeout: WAIT_FOREVER,
    });
    walletLogsHandler.setState(await repo.find());
  }, [repo]);

  const currentBalances: Balances = useMemo(() => {
    return walletLogs.reduce((balance, { currencyType, quantityChange }) => {
      balance[currencyType] += quantityChange;
      return balance;
    }, Object.assign({}, ...Object.values(CurrencyType).map((c) => ({ [c]: 0 }))) as Balances);
  }, [walletLogs]);

  const pendingChanges = useRef<Record<WalletLog["id"], WalletLog>>({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveChanges = useCallback(
    debounce((changes: WalletLog[]) => {
      if (!repo) return;
      waitUntil(() => !repo.queryRunner?.isTransactionActive).then(async () => {
        await repo.save(changes);
      });
    }, 300),
    [repo]
  );

  const requestSave = useCallback(
    (log: WalletLog) => {
      pendingChanges.current[log.id] = log;
      debouncedSaveChanges(Object.values(pendingChanges.current));
    },
    [debouncedSaveChanges]
  );

  const makeCallbacks = useCallback(
    (type: CurrencyType): LogEditorCallbacks<WalletLog> => ({
      filter: (log) => log.currencyType === type,
      add: async () => {
        const log = await repo!.save(repo!.create({ currencyType: type }));
        walletLogsHandler.append(log);
      },
      edit: async (log, prop, value) => {
        if (typeof prop === "undefined") return;
        const index = walletLogs.findIndex((l) => l.id === log.id);
        walletLogsHandler.setItemProp(index, prop, value);
        requestSave(Object.assign({}, log, { [prop]: value }));
      },
      remove: async (log) => {
        walletLogsHandler.remove(walletLogs.findIndex((l) => l.id === log.id));
        await repo!.remove(log);
      },
    }),
    [requestSave, walletLogs, walletLogsHandler, repo]
  );

  const pdCallbacks = useMemo(
    () => makeCallbacks(CurrencyType.POKE_DOLLAR),
    [makeCallbacks]
  );
  const wtCallbacks = useMemo(
    () => makeCallbacks(CurrencyType.WATTS),
    [makeCallbacks]
  );
  const rcCallbacks = useMemo(
    () => makeCallbacks(CurrencyType.RARE_CANDY),
    [makeCallbacks]
  );
  const fcCallbacks = useMemo(
    () => makeCallbacks(CurrencyType.FIZZY_CREDIT),
    [makeCallbacks]
  );

  const walletLogPropStyles = propStyles();
  const changePropToStuff = useMemo(
    () => ({
      propsToLabelsPairs: [{ prop: "quantityChange", label: "Change" }],
      propsToEditorComponentPairs: [
        numberPropToEditor<WalletLog, "quantityChange">("quantityChange"),
      ],
      propsToMantineClasses: walletLogPropStyles.classes,
    }),
    [walletLogPropStyles]
  ) as {
    propsToLabelsPairs?: PropToLabelPair<WalletLog>[];
    propsToEditorComponentPairs?: PropToEditorComponentPair<
      WalletLog,
      "quantityChange"
    >[];
    propsToMantineClasses?: Record<keyof WalletLog, string>;
  };

  return (
    <>
      <Stack>
        <Group
          sx={{
            alignContent: "center",
          }}
        >
          <Title
            order={2}
            sx={{
              width: "50%",
              textAlign: "right",
              marginRight: "auto",
            }}
          >
            Wallet
          </Title>
          <EditModeToggle checked={editModeOn} onToggle={setEditModeOn} />
        </Group>
        <Title order={3}>Summary</Title>
        <Box
          sx={(theme) => ({
            width: "100%",
            display: "grid",
            rowGap: "0.25em",
            padding: "0 2rem",
            ".mantine-Title-root": {
              borderBottom: "1px solid white",
              "&:nth-of-type(2n)": {
                gridColumn: "span 2",
                [theme.fn.largerThan("md")]: {
                  marginRight: "0.5em",
                },
              },
            },
            ".mantine-Text-root": {
              borderBottom: "1px solid white",
              "&:nth-of-type(3n+2)": {
                paddingRight: "0.5em",
                textAlign: "right",
              },
              "&:nth-of-type(3n+3)": {
                textAlign: "center",
                [theme.fn.largerThan("md")]: {
                  marginRight: "0.5em",
                },
              },
              [theme.fn.largerThan("md")]: {
                "&:nth-of-type(4), &:nth-of-type(5), &:nth-of-type(6)": {
                  order: 3,
                },
                "&:nth-of-type(7), &:nth-of-type(8), &:nth-of-type(9)": {
                  order: 2,
                },
                "&:nth-of-type(10), &:nth-of-type(11), &:nth-of-type(12)": {
                  order: 4,
                },
              },
            },
            [theme.fn.largerThan("md")]: {
              gridTemplateColumns: "1fr auto min-content 1fr auto min-content",
            },
            [theme.fn.smallerThan("md")]: {
              gridTemplateColumns: "1fr auto min-content",
            },
            ".responsive": {
              [theme.fn.smallerThan("md")]: {
                display: "none",
              },
            },
            "& svg": {
              display: "inline",
              verticalAlign: "middle",
              marginTop: "-0.3em",
            },
          })}
        >
          <Title order={4}>Currency</Title>
          <Title order={4} align="right">
            Balance
          </Title>
          <Title order={4} className="responsive">
            Currency
          </Title>
          <Title order={4} className="responsive" align="right">
            Balance
          </Title>
          <Text>PokéDollars</Text>
          <Text>
            {`${(currentBalances.pokedollar ?? 0).toLocaleString("en-US")}`}
          </Text>
          <Text>
            <PokeDollarIcon size="1em" />
          </Text>
          <Text>Watts</Text>
          <Text>{`${(currentBalances.watts ?? 0).toLocaleString(
            "en-US"
          )}`}</Text>
          <Text>W</Text>
          <Text>Rare Candies</Text>
          <Text>
            {`${(currentBalances.rarecandy ?? 0).toLocaleString("en-US")}`}
          </Text>
          <Text>
            <TbCandy size="1.3em" />
          </Text>
          <Text>Fizzy Credits</Text>
          <Text>
            {`${(currentBalances.fizzycredit ?? 0).toLocaleString("en-US")}`}
          </Text>
          <Text>FC</Text>
        </Box>

        <Title order={3}>Detail</Title>
        <Accordion variant="separated" multiple={true}>
          <Accordion.Item value="pd">
            <Accordion.Control>PokéDollars</Accordion.Control>
            <Accordion.Panel>
              <LogEditor
                logs={walletLogs}
                isShopLog={true}
                isEditMode={editModeOn}
                {...changePropToStuff}
                {...pdCallbacks}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="wt">
            <Accordion.Control>Watts</Accordion.Control>
            <Accordion.Panel>
              <LogEditor
                logs={walletLogs}
                isShopLog={true}
                isEditMode={editModeOn}
                {...changePropToStuff}
                {...wtCallbacks}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="rc">
            <Accordion.Control>Rare Candies</Accordion.Control>
            <Accordion.Panel>
              <LogEditor
                logs={walletLogs}
                isShopLog={true}
                isEditMode={editModeOn}
                {...changePropToStuff}
                {...rcCallbacks}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="fc">
            <Accordion.Control>Fizzy Credits</Accordion.Control>
            <Accordion.Panel>
              <LogEditor
                logs={walletLogs}
                isShopLog={true}
                isEditMode={editModeOn}
                {...changePropToStuff}
                {...fcCallbacks}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Title order={3}>Output Preview</Title>
        <Title order={3}>Wallet Log</Title>
      </Stack>
    </>
  );
};

export default Wallet;
