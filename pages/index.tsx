import {
  Blockquote,
  Stack,
  Text,
  Title,
  Anchor,
  Box,
  Group,
  Button,
  FileButton,
  TypographyStylesProvider,
  Spoiler,
} from "@mantine/core";
import { NextPage } from "next";
import { GiFox } from "react-icons/gi";
import { ButtonOpenSpreadsheetImportModal } from "~/components/spreadsheetImportModal";
import { DBService } from "~/services";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const [comingSoon, setComingSoon] = useState<string>("Loading...");
  const [changelog, setChangelog] = useState<string>("Loading...");

  useEffect(() => {
    axios.get("/soon_tm.md").then((response) => {
      setComingSoon(
        response.status === 200 ? response.data : "Could not load change log :("
      );
    });

    axios.get("/changelog.md").then((response) => {
      setChangelog(
        response.status === 200 ? response.data : "Could not load change log :("
      );
    });
  }, []);

  return (
    <>
      <Blockquote
        cite="- ChrisClark13"
        icon={<GiFox size={48} color="#cc1300" />}
        styles={{ icon: { marginRight: 32, marginLeft: -24 } }}
      >
        <Text>
          Welcome to the web app version of the Fizzy Tracker
          <br />
          <Anchor href="https://github.com/ChrisClark13/fizzy-bubbles-tracker/issues">
            {
              "Issues, problems, or ideas for improvement can be posted here on the website's GitHub issues page."
            }
          </Anchor>
          <br />
          <br />
          To use, go to any of pages on the left (or in hidden away in the menu
          button in the top left on mobile).
          <br />
          <br />
          Pages that let you do bookkeeping all have an {'"Edit Mode"'} toggle
          in the top right that needs to be turned on before you can make any
          changes.
          <br />
          <br />
          All BBCode output areas have two buttons in the top right that let you
          view the BBCode or copy it directly into your {"device's"} clipboard.
          <br />
          <br />
          The data here is stored your web browser, but soon you will also be
          able to save it in your Google Drive by logging in with a Google
          Account.
          <br />
          <br />
          Wiping your {"browser's"} cache completely will delete any local data
          for this web app.
          <br />
          <br />
          To prevent loss of data you can export and import the data using the
          buttons below.
          <br />
          (I recommended making use of this to create backups and transfer data
          between devices until I get the Google Drive sync working.)
          <br />
          <br />
          (And yes, this app is permanently in Dark Mode. Why would you use
          anything else.)
        </Text>
      </Blockquote>
      <Stack>
        <Title order={2}>Quick Log Post</Title>
        {'Coming soon "TM"'}
        <Title order={2}>Import and Export</Title>
        <Stack pl="lg">
          <Title order={5}>To / From {`'.fbtrack.db'`} file</Title>
          <Group>
            <Button onClick={DBService.saveToFile}>Save to File</Button>
            <FileButton
              onChange={DBService.loadFromFile}
              accept={".fbtrack.db"}
            >
              {(props) => <Button {...props}>Load from File</Button>}
            </FileButton>
          </Group>
          <Title order={5}>From workbook spreadsheet file (.xlsx, .ods)</Title>
          <Box>
            <ButtonOpenSpreadsheetImportModal />
          </Box>
        </Stack>

        <TypographyStylesProvider
          sx={{
            h3: {
              margin: "0",
            },
          }}
        >
          <Title order={2}>Coming Soonish</Title>
          <Spoiler
            pl="xl"
            maxHeight={250}
            hideLabel={"> Hide"}
            showLabel={"> Show More"}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comingSoon}
            </ReactMarkdown>
          </Spoiler>
          <Title order={2}>Change Log</Title>
          <Spoiler
            pl="xl"
            maxHeight={250}
            hideLabel={"> Hide"}
            showLabel={"> Show More"}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {changelog}
            </ReactMarkdown>
          </Spoiler>
        </TypographyStylesProvider>
      </Stack>
    </>
  );
};

export default Home;
