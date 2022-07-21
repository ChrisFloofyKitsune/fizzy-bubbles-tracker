import { Stack, Title } from "@mantine/core";
import { NextPage } from "next";

const Pokemon: NextPage = () => {
    return <>
        <Stack>
            <Title order={3}>Select Pokemon</Title>
            <Title order={3}>Pokemon Profile</Title>
            <Title order={3}>Output Preview</Title>
        </Stack>
    </>
}

export default Pokemon;