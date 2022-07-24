import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Box, Button, Center, Group, LoadingOverlay, MantineProvider, Paper, ScrollArea, Skeleton, Switch, Title } from '@mantine/core';
import { AppShell, Header, Navbar, MediaQuery, Burger, useMantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { AppNavbar, GoogleSessionProvider, GoogleLoginCredentials, GoogleDriveCommunicator } from "~/components/";
import { DataSourceContext, DataSourceOptions, DataSourceProvider } from '~/services/';
import { BBCodeReplacementConfig, ContestStatLog, ItemDefinition, ItemLog, LevelLog, MoveLog, Pokemon, Trainer, WalletLog, MiscValue } from '~/orm/entities';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import jwt from 'jwt-decode';
import localforage from 'localforage';
import { TbBrandGoogleDrive } from 'react-icons/tb';
import { useResizeObserver } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';

let DataSourceOpts: DataSourceOptions = {
  entities: [
    Trainer,
    Pokemon,
    MoveLog,
    LevelLog,
    ContestStatLog,
    ItemDefinition,
    ItemLog,
    WalletLog,
    BBCodeReplacementConfig,
    MiscValue
  ]
}

function MyApp({ Component, pageProps }: AppProps) {

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<GoogleLoginCredentials | null | 'ERROR'>(null)
  const [googleSyncEnabled, setGoogleSyncEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localforage.getItem<boolean>('google-drive-sync-enabled').then(value => {
      setGoogleSyncEnabled(!!value);
    })
  }, [])

  const [contentBoxRef, contentBoxRect] = useResizeObserver();

  return (
    // <GoogleOAuthProvider clientId='39206396503-heot00318gquae6rrc7diepb5uj4pa4i.apps.googleusercontent.com'>
    //   <GoogleSessionProvider requestAuth={googleSyncEnabled} loginCredentials={typeof loginCredentials === 'object' ? loginCredentials : null}>
    <DataSourceProvider options={DataSourceOpts}>
      <GoogleDriveCommunicator autoSaveOn={googleSyncEnabled} />
      <DataSourceContext.Consumer>
        {ds => (
          <MantineProvider
            theme={{ colorScheme: 'dark' }}
            withGlobalStyles
            withNormalizeCSS
            styles={{
              Button: { root: { transitionDuration: '0.25s' } }
            }}
          >
            <ModalsProvider>

              <LoadingOverlay
                visible={!ds}
                sx={(theme) => ({
                  svg: {
                    width: '50%',
                    height: '50%',
                    stroke: theme.colors.teal[9]
                  }
                })}
              />
              <AppShell
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                fixed
                navbar={
                  <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
                    <AppNavbar />
                  </Navbar>
                }
                // footer={
                //   <Footer height={60} p="md">
                //     Application footer
                //   </Footer>
                // }
                header={
                  <Header height={64}>
                    <Box p='md' sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                        <Burger
                          opened={opened}
                          onClick={() => setOpened((o) => !o)}
                          size="sm"
                          color={theme.colors.gray[6]}
                          mr="xl"
                        />
                      </MediaQuery>
                      <Title>Fizzy Tracker 2.0</Title>
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
                padding='0'
              >
                <Box
                  ref={contentBoxRef}
                  sx={{
                    // paddingTop: headerRect.height,
                    width: '100%',
                    height: `100%`,
                    backgroundColor: 'black'
                  }
                  }>
                  <ScrollArea type='auto' styles={{
                    viewport: {
                      height: `${contentBoxRect.height}px`,
                      '& > div': {
                        display: 'block!important'
                      }
                    }
                  }}>
                    <Paper m='sm' p='sm'>
                      {
                        (!!ds) ?
                          <Component {...pageProps} /> :
                          <>
                            <Skeleton height={50} circle mb="xl" />
                            <Skeleton height={8} radius="xl" />
                            <Skeleton height={8} mt={6} radius="xl" />
                            <Skeleton height={8} mt={6} width="70%" radius="xl" />
                          </>
                      }
                    </Paper>
                  </ScrollArea>
                </Box>
              </AppShell>
            </ModalsProvider>
          </MantineProvider>
        )}
      </DataSourceContext.Consumer>
    </DataSourceProvider>
    //   </GoogleSessionProvider>
    // </GoogleOAuthProvider>
  );
}

export default MyApp;
