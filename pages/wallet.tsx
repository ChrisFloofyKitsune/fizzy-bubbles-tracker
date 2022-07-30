import {
  Accordion,
  Box,
  createStyles,
  Group,
  ScrollArea,
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
import { BBCodeArea, EditModeToggle } from "~/components";
import { useListState } from "@mantine/hooks";
import { CurrencyType, CurrencyTypeDisplayName } from "~/orm/enums";
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

  const callbacks: { [V in CurrencyType]: LogEditorCallbacks<WalletLog> } =
    useMemo(() => {
      return Object.assign(
        {},
        ...Object.values(CurrencyType).map((ct) => ({
          [ct]: makeCallbacks(ct),
        }))
      );
    }, [makeCallbacks]);

  const walletLogPropStyles = propStyles();
  const changePropAttributes = useMemo(
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
            <Text weight={500}>W</Text>
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
        </Box>

        <Title order={3}>Detail</Title>
        <Accordion
          variant="separated"
          multiple={true}
          sx={(theme) => ({
            ".mantine-Accordion-panel": {
              margin: "0.5em",
              borderRadius: "0.5em",
              border: "1px solid " + theme.colors.gray[7],
              backgroundColor: theme.fn.darken(theme.colors.gray[9], 0.2),
            },
            ".mantine-Accordion-content": {
              borderRadius: "0.5em",
              overflow: "clip",
              padding: "2px",
              ".mantine-ScrollArea-viewport": {
                paddingBottom: editModeOn ? "1em" : "",
              },
            },
          })}
        >
          {Object.values(CurrencyType).map((ct) => (
            <Accordion.Item key={ct} value={ct}>
              <Accordion.Control>
                {CurrencyTypeDisplayName[ct][1]}
              </Accordion.Control>
              <Accordion.Panel>
                <ScrollArea.Autosize maxHeight="40vh">
                  <LogEditor
                    logs={walletLogs}
                    isShopLog={true}
                    isEditMode={editModeOn}
                    {...changePropAttributes}
                    {...callbacks[ct]}
                  />
                </ScrollArea.Autosize>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        <Title order={3}>Output</Title>
        <Stack>
          {Object.values(CurrencyType).map((ct) => (
            <BBCodeArea
              key={`output-${ct}`}
              label={CurrencyTypeDisplayName[ct][1] + " Log"}
              bbCode={WalletLog.createBBCode(walletLogs, ct)}
            />
          ))}
        </Stack>
      </Stack>
    </>
  );
};

export default Wallet;
