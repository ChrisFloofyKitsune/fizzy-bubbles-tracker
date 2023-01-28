import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  Box,
  LoadingOverlay,
  MantineProvider,
  Paper,
  ScrollArea,
  Skeleton,
  Title,
} from "@mantine/core";
import {
  AppShell,
  Header,
  Navbar,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import localforage from "localforage";
import { useResizeObserver } from "@mantine/hooks";

import {
  AppNavbar,
  UtcClock,
  // GoogleLoginCredentials,
  // GoogleDriveCommunicator,
} from "~/components/";
import {
  DataSourceContext,
  DataSourceOptions,
  DataSourceProvider,
} from "~/services/";
import * as entities from "~/orm/entities";
import * as migrations from "~/orm/migrations";
import { ModalsProvider } from "@mantine/modals";
import { Prism } from "prism-react-renderer";
import { Modals } from "~/modalsList";
import { emotionCache } from "../emotion-cache";
import { useRouter } from "next/router";
import { FizzyDexProvider } from "~/services/FizzyDexService";
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-bbcode");
console.log("Starting app...");

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import objectSupport from "dayjs/plugin/objectSupport";
// import forceUtc from "~/dayJsForceUtcPlugin";
import { appScrollSubject } from "~/useAppScroll";
dayjs.extend(utc);
dayjs.extend(objectSupport);
// dayjs.extend(forceUtc);

let DataSourceOpts: DataSourceOptions = {
  entities: [
    entities.Trainer,
    entities.Pokemon,
    entities.EggMoveLog,
    entities.MachineMoveLog,
    entities.TutorMoveLog,
    entities.OtherMoveLog,
    entities.LevelLog,
    entities.BondLog,
    entities.ContestStatLog,
    entities.ItemDefinition,
    entities.ItemLog,
    entities.WalletLog,
    entities.BBCodeReplacementConfig,
    entities.MiscValue,
    entities.Setting,
    entities.BondStylingConfig,
    entities.UrlNote,
  ],
  migrations: Array.from(Object.values(migrations)),
};

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  // const [loginCredentials, setLoginCredentials] = useState<
  //   GoogleLoginCredentials | null | "ERROR"
  // >(null);
  const [googleSyncEnabled, setGoogleSyncEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localforage.getItem<boolean>("google-drive-sync-enabled").then((value) => {
      setGoogleSyncEnabled(!!value);
    });
  }, []);

  const [headerRef, headerBoxRect] = useResizeObserver();
  const [changingPage, setChangingPage] = useState<boolean>(false);

  const router = useRouter();
  useEffect(() => {
    const onRouteChange = () => {
      setOpened(false);
      setChangingPage(true);
    };

    const onRouteComplete = () => {
      setChangingPage(false);
    };

    router.events.on("routeChangeStart", onRouteChange);
    router.events.on("routeChangeComplete", onRouteComplete);
    router.events.on("routeChangeError", onRouteComplete);

    return () => {
      router.events.off("routeChangeStart", onRouteChange);
      router.events.off("routeChangeComplete", onRouteComplete);
      router.events.off("routeChangeError", onRouteComplete);
    };
  }, [router, setOpened]);

  return (
    // <GoogleOAuthProvider clientId='39206396503-heot00318gquae6rrc7diepb5uj4pa4i.apps.googleusercontent.com'>
    //   <GoogleSessionProvider requestAuth={googleSyncEnabled} loginCredentials={typeof loginCredentials === 'object' ? loginCredentials : null}>
    <DataSourceProvider options={DataSourceOpts}>
      <FizzyDexProvider>
        {/*<GoogleDriveCommunicator autoSaveOn={googleSyncEnabled} />*/}
        <DataSourceContext.Consumer>
          {(ds) => (
            <MantineProvider
              withGlobalStyles
              withNormalizeCSS
              emotionCache={emotionCache}
              theme={{
                colorScheme: "dark",
                components: {
                  Button: {
                    styles: {
                      root: { transitionDuration: "0.25s" },
                    },
                  },
                },
              }}
            >
              <ModalsProvider modals={Modals}>
                <LoadingOverlay
                  visible={!ds || changingPage}
                  sx={(theme) => ({
                    svg: {
                      width: "50%",
                      height: "50%",
                      stroke: theme.colors.teal[9],
                    },
                  })}
                />
                <AppShell
                  navbarOffsetBreakpoint="sm"
                  asideOffsetBreakpoint="sm"
                  fixed
                  navbar={
                    <Navbar
                      p="md"
                      hiddenBreakpoint="sm"
                      hidden={!opened}
                      width={{ sm: 200, lg: 300 }}
                    >
                      <AppNavbar />
                    </Navbar>
                  }
                  header={
                    <Header ref={headerRef} height={64}>
                      <Box
                        p="md"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <MediaQuery
                          largerThan="sm"
                          styles={{ display: "none" }}
                        >
                          <Burger
                            opened={opened}
                            onClick={() => setOpened((o) => !o)}
                            size="sm"
                            color={theme.colors.gray[6]}
                            mr="xl"
                          />
                        </MediaQuery>
                        <Title>Fizzy Tracker App</Title>
                        <MediaQuery
                          smallerThan={540}
                          styles={{ display: "none" }}
                        >
                          <Box ml="auto">
                            <UtcClock />
                          </Box>
                        </MediaQuery>
                        {/* <Box ml='auto'>
                            {
                              (!loginCredentials) ?
                                <GoogleLogin
                                  onSuccess={(res) => res.credential && setLoginCredentials(jwt(res.credential))}
                                  onError={() => console.error('GSI Error')}
                                  context={'use'}
                                  useOneTap
                                  auto_select
                                  theme='filled_black'
                                /> :
                                <Group>
                                  <Switch
                                    label={<Center><TbBrandGoogleDrive size={32} />GDrive Sync</Center>}
                                    offLabel='OFF' onLabel='ON' size='lg'
                                    checked={googleSyncEnabled}
                                    onChange={(event) => {
                                      const value = event.currentTarget.checked;
                                      localforage.setItem<boolean>('google-drive-sync-enabled', value).then(result => {
                                        setGoogleSyncEnabled(result);
                                      });
                                    }}
                                  />
                                  <Button color='red' onClick={() => {
                                    googleLogout();
                                    setLoginCredentials(null);
                                  }}>
                                    SIGN OUT FROM GOOGLE
                                  </Button>
                                </Group>
                            }
                          </Box> */}
                      </Box>
                    </Header>
                  }
                  padding={0}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: `100%`,
                      backgroundColor: "black",
                    }}
                  >
                    <ScrollArea
                      onScrollPositionChange={(pos) =>
                        appScrollSubject.next(pos.y)
                      }
                      type="auto"
                      styles={{
                        viewport: {
                          height: `calc(100vh - ${headerBoxRect.bottom + 1}px)`,
                          "& > div": {
                            display: "block!important",
                          },
                        },
                      }}
                    >
                      <Paper m="sm" p="sm">
                        {!!ds ? (
                          <Component {...pageProps} />
                        ) : (
                          <>
                            <Skeleton height={50} circle mb="xl" />
                            <Skeleton height={8} radius="xl" />
                            <Skeleton height={8} mt={6} radius="xl" />
                            <Skeleton
                              height={8}
                              mt={6}
                              width="70%"
                              radius="xl"
                            />
                          </>
                        )}
                      </Paper>
                    </ScrollArea>
                  </Box>
                </AppShell>
              </ModalsProvider>
            </MantineProvider>
          )}
        </DataSourceContext.Consumer>
      </FizzyDexProvider>
    </DataSourceProvider>
    //   </GoogleSessionProvider>
    // </GoogleOAuthProvider>
  );
}

// noinspection JSUnusedGlobalSymbols
export default MyApp;
