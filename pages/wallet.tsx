import { Stack, Title } from "@mantine/core";
import { NextPage } from "next";

const Wallet: NextPage = () => {
    return <>
        <Stack>
            <Title order={3}>Current Wallet</Title>
            <Title order={3}>Output Preview</Title>
            <Title order={3}>Wallet Log</Title>
        </Stack>
    </>;
};

export default Wallet;
