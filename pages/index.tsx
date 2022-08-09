import { Blockquote, List, Stack, Text, Title, Anchor } from "@mantine/core";
import { NextPage } from "next";
import { GiFox } from "react-icons/gi";

const Home: NextPage = () => {
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

        <Title order={2}>Update Log</Title>
        <Text>
          v0.1 -- Initial Release
          <List withPadding>
            <List.Item>
              Pages: Trainers, Pokemon, Items, Wallet, Bond, Word Counter,
              Settings, and a hidden-by-default Data page.
            </List.Item>
            <List.Item>
              Feature: Import from spreadsheet downloaded as a copy of the
              previous tracker that was based in Google Sheets.
            </List.Item>
            <List.Item>
              Feature: Import (Upload) from and Export (Download) to file on
              your local device.
            </List.Item>
            <List.Item>
              To Do: Add Quick Logging feature to easily log everything that has
              happened in a single post.
            </List.Item>
            <List.Item>
              To Do: Get Google Drive syncing working in an easy-to-use and
              unobtrusive way.
            </List.Item>
          </List>
        </Text>
      </Stack>
    </>
  );
};

export default Home;
