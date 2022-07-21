import { Stack, Title } from "@mantine/core";
import { NextPage } from "next";

const Items: NextPage = () => {
    return <>
        <Stack>
            <Title order={3}>Current Inventory</Title>
            <Title order={3}>Output Preview</Title>
            <Title order={3}>Item Log</Title>
        </Stack>
    </>
}

export default Items;
