import {
  useDebouncedListSave,
  useRepository,
  waitForTransactions,
} from "~/services";
import { BBCodeReplacementConfig, Pokemon } from "~/orm/entities";
import { useElementSize, useListState } from "@mantine/hooks";
import { useAsyncEffect } from "use-async-effect";
import { Like } from "typeorm";
import {
  Divider,
  Group,
  List,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Textarea,
  Title,
  Text,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";

const pokeProps = [
  "name",
  "subHeading",
  "species",
  "dexNum",
  "ability",
  "type",
  "nature",
  "gender",
  "imageLink",
  "description",
  "obtained",
  "obtainedLink",
  "pokeball",
  "pokeballLink",
  "heldItem",
  "heldItemLink",
  "boutiqueMods",
  "boutiqueModsLink",
  "evolutionStageOne",
  "evolutionStageTwoMethod",
  "evolutionStageTwoMethodLink",
  "evolutionStageTwo",
  "evolutionStageThreeMethod",
  "evolutionStageThreeMethodLink",
  "evolutionStageThree",
] as (keyof Pokemon)[];

export function PokemonTemplatesEditor() {
  const configRepo = useRepository(BBCodeReplacementConfig);
  const [configs, configsHandler] = useListState<BBCodeReplacementConfig>([]);

  useAsyncEffect(async () => {
    if (!configRepo) return;
    await waitForTransactions(configRepo);
    configsHandler.setState(
      await configRepo.findBy({ specifier: Like("Pokemon%") })
    );
  }, [configRepo]);

  const [tab, setTab] = useState<string | null>("Pokemon");
  const [templateText, setTemplateText] = useState<string>();

  useEffect(() => {
    const config = configs.find((c) => c.specifier === tab);
    setTemplateText(
      config ? config.customTemplate || config.customTemplateDefault : ""
    );
  }, [tab, configs]);

  const saveChanges = useDebouncedListSave(configRepo);

  const props = useMemo(
    () => pokeProps.map((p) => <List.Item key={p}>{`{{${p}}}`}</List.Item>),
    []
  );

  const methods = useMemo(
    () =>
      Object.getOwnPropertyNames(Pokemon.prototype)
        .filter((p) => p.match(/bbcode$/i))
        .map((p) => <List.Item key={p}>{`{{${p}}}`}</List.Item>),
    []
  );

  const subTemplates = useMemo(
    () =>
      configs
        .filter((c) => c.specifier.includes("."))
        .map((c) => (
          <List.Item key={c.specifier}>{`{{${c.specifier.replace(
            "Pokemon.",
            ""
          )}}}`}</List.Item>
        )),
    [configs]
  );

  const { ref, height } = useElementSize<HTMLTextAreaElement>();

  return (
    <>
      <Paper withBorder p="1em">
        <Group>
          <Tabs
            value={tab}
            onTabChange={setTab}
            orientation="vertical"
            variant="pills"
          >
            <Tabs.List>
              {configs.map((c) => (
                <Tabs.Tab key={c.specifier} value={c.specifier}>
                  {c.specifier.replace(/Pokemon\.?/, "") || "(Base)"}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Divider orientation="vertical" />
          <Textarea
            label={
              <Title order={4}>
                Delete everything to reset template to default
              </Title>
            }
            ref={ref}
            autosize
            minRows={30}
            value={templateText}
            onChange={(event) => {
              const value = event.currentTarget.value;
              const config = configs.find((c) => c.specifier === tab);
              if (!config) return;
              setTemplateText(value);
              const index = configs.indexOf(config);
              configsHandler.setItemProp(index, "customTemplate", value);
              saveChanges(config, { customTemplate: value });
            }}
            sx={{
              flexGrow: 1,
            }}
            styles={{
              input: {
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflowX: "scroll",
              },
            }}
          />
          <Divider orientation="vertical" />
          <Stack
            sx={{
              height: "100%",
            }}
          >
            <Title order={4}>Possible Placeholders</Title>
            <ScrollArea
              offsetScrollbars
              sx={{
                height: `${height}px`,
              }}
            >
              <Title order={5} mt="md">
                Pokemon Properties
              </Title>
              <List>{props}</List>
              <Title order={5} mt="md">
                Calculated BBCode
              </Title>
              <Text>
                Most just auto-wrap with the
                <br />
                appropriate bbcode
                <br />
                (Such as [url] if the corresponding
                <br />
                link exists.)
                <br />
                <strong>Or</strong> they convert a list into bbcode.
              </Text>
              <List>{methods}</List>
              <Title order={5} mt="md">
                Sub Templates
              </Title>
              <List>{subTemplates}</List>
            </ScrollArea>
          </Stack>
        </Group>
      </Paper>
    </>
  );
}
