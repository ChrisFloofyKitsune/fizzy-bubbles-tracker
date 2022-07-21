import { Blockquote, Stack, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { GiFox } from 'react-icons/gi';

const Home: NextPage = () => {
    return <>
        <Blockquote
            cite="- ChrisClark13"
            icon={<GiFox size={48} color='#cc1300' />}
            styles={{icon: { marginRight: 32, marginLeft: -24 }}}
        >
            <Text>
                Welcome to the latest Experimental Fizzy Tracker<br />
                The data here is stored your web browser, but you can login to Google to also save it in your Google Drive.<br />
                You can also export and import the data from the 'Data' page.
            </Text>
        </Blockquote>
        <Stack>
            <Title order={3}>Log Post</Title>
            <Title order={3}>Output Preview</Title>
            <Title order={3}>Update Log</Title>
        </Stack>
    </>
}

export default Home;
