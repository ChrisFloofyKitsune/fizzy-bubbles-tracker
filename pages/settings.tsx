import {
  Box,
  List,
  NumberInput,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { Setting } from "~/orm/entities";
import { useDebouncedListSave, useRepository } from "~/services";
import { useListState } from "@mantine/hooks";
import { useAsyncEffect } from "use-async-effect";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SettingEnum } from "~/settingEnum";
import { PokemonProfileExample } from "~/pageComponents/settings/PokemonProfileExample";
import { PokemonTemplatesEditor } from "~/pageComponents/settings/PokemonTemplatesEditor";
import { AccordionSpoiler } from "~/components/AccordionSpoiler";

const SettingsPage: NextPage = () => {
  const settingRepo = useRepository(Setting);
  const [settings, settingsHandler] = useListState<Setting>([]);

  useAsyncEffect(async () => {
    if (!settingRepo) return;
    settingsHandler.setState(await settingRepo.find());
  }, [settingRepo]);

  const debouncedSave = useDebouncedListSave(settingRepo);

  const changeSetting = useCallback(
    async (setting: Setting, value: string | number | boolean) => {
      const index = settings.findIndex((s) => s === setting);
      settingsHandler.setItemProp(index, "value", value);
      debouncedSave(setting, { value });
    },
    [debouncedSave, settings, settingsHandler]
  );

  const enableTemplateEditor = useMemo(() => {
    if (!settings) return false;
    return (
      (settings.find((s) => s.id === SettingEnum.AdvancedUsePokemonTemplates)
        ?.value as boolean) ?? false
    );
  }, [settings]);

  const [accordionSelected, setAccordionSelected] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!enableTemplateEditor && accordionSelected === "pokemon-templates") {
      setAccordionSelected(null);
    }
  }, [accordionSelected, enableTemplateEditor]);

  return (
    <>
      <Stack>
        <Title order={2}>Settings</Title>
      </Stack>
      <SimpleGrid
        breakpoints={[
          { maxWidth: "sm", cols: 1 },
          { minWidth: "sm", cols: 2 },
        ]}
      >
        <GroupSettings
          group={"PokemonFormat"}
          label={"Pokemon Profile Formatting"}
          settings={settings}
          changeSetting={changeSetting}
        />
        <Stack>
          <GroupSettings
            group={"Advanced"}
            label={"Advanced"}
            settings={settings}
            changeSetting={changeSetting}
          />
          <GroupSettings
            group={"Debug"}
            label={"Technical / Debug"}
            settings={settings}
            changeSetting={changeSetting}
          />
        </Stack>
      </SimpleGrid>
      <PokemonProfileExample />
      <Space h="1em" />
      <AccordionSpoiler
        disabled={!enableTemplateEditor}
        label={
          <Title order={4}>
            Edit Pokemon Profile Templates
            {enableTemplateEditor ? "" : " (Enable to use)"}
          </Title>
        }
      >
        <PokemonTemplatesEditor />
      </AccordionSpoiler>
    </>
  );
};

interface GroupSettingsProps {
  group: string;
  label: string;
  settings: Setting[];
  changeSetting: (setting: Setting, value: any) => void;
}
function GroupSettings({
  group,
  label,
  settings,
  changeSetting,
}: GroupSettingsProps) {
  const mySettings = useMemo(
    () => settings.filter((s) => s.group === group),
    [group, settings]
  );
  return (
    <Box
      key={group}
      my={"md"}
      sx={{
        width: "100%",
      }}
    >
      <Title order={4} mb="xs">
        {label}
      </Title>
      <List
        spacing="md"
        sx={(theme) => ({
          listStylePosition: "outside",
          border: "1px solid " + theme.colors.dark[2],
          borderRadius: "0.5em",
          padding: "1em",
          paddingLeft: "2.5em",
          ".mantine-List-itemWrapper": {
            display: "inline-block",
          },
        })}
      >
        {mySettings.map((s) => (
          <List.Item key={s.id} sx={{}}>
            <Stack
              align="start"
              spacing={0}
              sx={{
                display: "inline-flex",
              }}
            >
              <Title order={6}>{s.name}</Title>
              <Text mb={"sm"}>
                {s.description.split("\n").map((l, i, arr) => (
                  <>
                    {l}
                    {arr.length > 1 && arr.length - 1 !== i ? <br /> : <></>}
                  </>
                ))}
              </Text>
              {s.type === "string" && (
                <TextInput
                  value={(s.value ?? s.defaultValue) as string}
                  onChange={(event) =>
                    changeSetting(s, event.currentTarget.value)
                  }
                />
              )}
              {s.type === "number" && (
                <NumberInput
                  value={(s.value ?? s.defaultValue) as number}
                  onChange={(value) => {
                    if (value) changeSetting(s, value);
                  }}
                />
              )}
              {s.type === "boolean" && (
                <Switch
                  size="lg"
                  checked={(s.value ?? s.defaultValue) as boolean}
                  onChange={(event) =>
                    changeSetting(s, event.currentTarget.checked)
                  }
                />
              )}
              {s.type === "enum" && (
                <Select
                  data={s.enumValues!}
                  value={(s.value ?? s.defaultValue) as string}
                  onChange={(value) => {
                    if (value) changeSetting(s, value);
                  }}
                />
              )}
            </Stack>
          </List.Item>
        ))}
      </List>
    </Box>
  );
}

export default SettingsPage;
