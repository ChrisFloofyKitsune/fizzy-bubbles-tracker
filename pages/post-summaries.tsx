import { NextPage } from "next";
import { useDataSource } from "~/services";
import { useAsyncEffect } from "use-async-effect";
import { DataSource } from "typeorm";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { UrlNote, WalletLog } from "~/orm/entities";
import { useListState } from "@mantine/hooks";
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Radio,
  Select,
  Space,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { AddIcon, CancelIcon } from "~/appIcons";
import { PostSummary } from "~/pageComponents/post-summaries/PostSummary";
import { EditModeToggle } from "~/components";
import { css } from "@emotion/react";
import { DatePicker } from "@mantine/dates";
import { isNotEmpty, useForm } from "@mantine/form";
import { countWordsInBBCode } from "~/wordCountUtil";
import { CurrencyType } from "~/orm/enums";
import dayjs from "dayjs";

const getMissingUrlsQuery = `
    SELECT note, url, date
    from (SELECT DISTINCT coalesce(sourceNote, 'wallet change: ' || wallet_log.currencyType || ' ' ||
                                               wallet_log.quantityChange) as note,
                          sourceUrl                                       as url,
                          date(date / 1000, 'unixepoch')                  as 'date'
          FROM wallet_log
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'item change: ' || idef.name || ' ' || item_log.quantityChange) as note,
                          sourceUrl                                                                            as url,
                          date(date / 1000, 'unixepoch')                                                       as 'date'
          FROM item_log
                   LEFT JOIN item_definition idef on item_log.itemDefinitionId = idef.id
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'level change to: ' || level_log.value || ' for ' || p.name) as note, sourceUrl as url, null as 'date'
          FROM level_log
                   LEFT JOIN pokemon p on p.uuid = level_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'bond change for ' || p.name) as note,
                          sourceUrl                                          as url,
                          date(date / 1000, 'unixepoch')                     as 'date'
          FROM bond_log
                   LEFT JOIN pokemon p on p.uuid = bond_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT (obtained || ' ' || coalesce(pokemon.name, '(Unnamed)') || ' the ' ||
                           pokemon.species) as note,
                          obtainedLink      as url,
                          null              as 'date'
          FROM pokemon
          WHERE obtainedLink IS NOT NULL
            AND obtainedLink != ''
          UNION ALL
          SELECT DISTINCT ('boutique visit for ' || coalesce(pokemon.name, '(Unnamed)') || ' the ' ||
                           pokemon.species) as note,
                          boutiqueModsLink  as url,
                          null              as 'date'
          FROM pokemon
          WHERE boutiqueModsLink IS NOT NULL
            AND boutiqueModsLink != ''
          UNION ALL
          SELECT DISTINCT ('gave pokeball ' || pokeball || ' to ' || coalesce(pokemon.name, '(Unnamed)') || ' the ' ||
                           pokemon.species) as note,
                          pokeballLink      as url,
                          null              as 'date'
          FROM pokemon
          WHERE pokeballLink IS NOT NULL
            AND pokeballLink != ''
          UNION ALL
          SELECT DISTINCT ('gave item ' || pokemon.heldItem || ' to ' || coalesce(pokemon.name, '(Unnamed)') ||
                           ' the ' ||
                           pokemon.species) as note,
                          heldItemLink      as url,
                          null              as 'date'
          FROM pokemon
          WHERE heldItemLink IS NOT NULL
            AND heldItemLink != ''
          UNION ALL
          SELECT DISTINCT ('evolution into ' || pokemon.evolutionStageTwo || ' for ' ||
                           coalesce(pokemon.name, '(Unnamed)') || ' the ' ||
                           pokemon.species)           as note,
                          evolutionStageTwoMethodLink as url,
                          null                        as 'date'
          FROM pokemon
          WHERE evolutionStageTwoMethodLink IS NOT NULL
            AND evolutionStageTwoMethodLink != ''
          UNION ALL
          SELECT DISTINCT ('evolution into ' || pokemon.evolutionStageThree || ' for ' ||
                           coalesce(pokemon.name, '(Unnamed)') || ' the ' ||
                           pokemon.species)             as note,
                          evolutionStageThreeMethodLink as url,
                          null                          as 'date'
          FROM pokemon
          WHERE evolutionStageThreeMethodLink IS NOT NULL
            AND evolutionStageThreeMethodLink != ''
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'contest stat change for ' || p.name) as note,
                          sourceUrl                                                  as url,
                          null                                                       as 'date'
          FROM contest_stat_log
                   LEFT JOIN pokemon p on p.uuid = contest_stat_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'egg move ' || move || ' learned for ' || p.name) as note,
                          sourceUrl                                                              as url,
                          null                                                                   as 'date'
          FROM egg_move_log
                   LEFT JOIN pokemon p on p.uuid = egg_move_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'tutor move ' || move || ' learned for ' || p.name) as note,
                          sourceUrl                                                                as url,
                          null                                                                     as 'date'
          FROM tutor_move_log
                   LEFT JOIN pokemon p on p.uuid = tutor_move_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'machine move ' || move || ' learned for ' || p.name) as note,
                          sourceUrl                                                                  as url,
                          null                                                                       as 'date'
          FROM machine_move_log
                   LEFT JOIN pokemon p on p.uuid = machine_move_log.pokemonUuid
          UNION ALL
          SELECT DISTINCT coalesce(sourceNote, 'other move ' || move || ' learned for ' || p.name) as note,
                          sourceUrl                                                                as url,
                          null                                                                     as 'date'
          FROM other_move_log
                   LEFT JOIN pokemon p on p.uuid = other_move_log.pokemonUuid)
    WHERE url IS NOT NULL
      AND url NOT IN (SELECT un.url
                      FROM url_note un)
`;

async function initUrlNotes(ds: DataSource): Promise<any> {
  const missingUrls: Record<"note" | "url" | "date", string>[] = await ds.query(
    getMissingUrlsQuery
  );

  const urlSet = new Set(missingUrls.map((m) => m.url));
  const result: UrlNote[] = [];

  for (const url of urlSet) {
    const firstMatch = missingUrls.find(
      (m) => m.url === url && m.note !== null
    );

    const date = missingUrls.find((m) => m.url === url && !!m.date)?.date;

    const label = firstMatch?.note ?? url;
    const newNote = new UrlNote();
    newNote.url = url;
    newNote.label = label;
    newNote.date = date ? dayjs(date).utc() : null;
    result.push(newNote);
  }

  if (result.length > 0) {
    console.log(`saving ${result.length} url_notes`);
    await ds.getRepository(UrlNote).save(result);
  }
}

const PostSummariesPage: NextPage = () => {
  const ds = useDataSource();
  const [urlNotes, urlNotesHandler] = useListState<UrlNote>([]);
  const [selectedUrl, setSelectedUrl] = useState<UrlNote>();
  const [editModeOn, setEditModeOn] = useState(false);

  useAsyncEffect(async () => {
    if (!ds) return;
    await initUrlNotes(ds);
    urlNotesHandler.setState(await ds.getRepository(UrlNote).find());
  }, [ds]);

  // MODAL STATE
  const [createModalOpened, setCreateModelOpened] = useState(false);

  const modalForm = useForm({
    initialValues: {
      url: "",
      date: dayjs().utc().toDate(),
      label: "",
      rpRewards: "none",
      postText: "",
    },
    validate: {
      url: isNotEmpty("Required"),
      label: isNotEmpty("Required"),
      postText(value, values) {
        if (values.rpRewards !== "none" && value === "") {
          return "Paste the In Character Roleplay text.";
        }
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  const cancelModal = useCallback(() => {
    setCreateModelOpened(false);
    modalForm.reset();
  }, [modalForm]);

  const [wordCount, pokedollarReward] = useMemo(() => {
    const count = countWordsInBBCode(modalForm.values.postText);
    let reward = 0;
    if (count >= 150) {
      switch (modalForm.values.rpRewards) {
        case "full":
          reward = Math.min(500, 150 + Math.floor((wordCount - 150) / 25) * 25);
          break;
        case "half":
          reward = Math.min(250, 75 + Math.floor((wordCount - 75) / 50) * 50);
          break;
        default:
          reward = 0;
          break;
      }
    }
    return [count, reward];
  }, [modalForm.values.postText, modalForm.values.rpRewards]);

  const onSubmit = useCallback(
    async (values: typeof modalForm.values) => {
      if (!ds) return;
      if (pokedollarReward > 0) {
        const walletRepo = ds.getRepository(WalletLog);
        await walletRepo.save(
          walletRepo.create({
            currencyType: CurrencyType.POKE_DOLLAR,
            sourceUrl: values.url,
            sourceNote: values.label + ` (${wordCount} Words)`,
            date: dayjs(values.date).utc(),
            quantityChange: pokedollarReward,
            verifiedInShopUpdate: false,
          })
        );

        const urlNoteRepo = ds.getRepository(UrlNote);
        const newUrlNote = await urlNoteRepo.save(urlNoteRepo.create(values));
        urlNotesHandler.setState(await urlNoteRepo.find());
        setSelectedUrl(newUrlNote);
      }
    },
    [modalForm, wordCount, pokedollarReward, ds]
  );

  return (
    <div>
      <Modal
        opened={createModalOpened}
        onClose={cancelModal}
        centered
        radius="md"
        size="xl"
        styles={{
          title: {
            paddingLeft: 36,
            flexGrow: 1,
          },
        }}
        title={<Title align="center">Create New Post Summary</Title>}
      >
        <form onSubmit={modalForm.onSubmit(onSubmit)}>
          <Stack>
            <TextInput
              required
              label="Post URL"
              {...modalForm.getInputProps("url")}
            />
            <Group spacing="xs">
              <DatePicker
                sx={{ width: "7em" }}
                label="Date"
                clearable={false}
                inputFormat="DD-MMM-YYYY"
                firstDayOfWeek="sunday"
                required
                styles={{
                  input: { textAlign: "center" },
                }}
                {...modalForm.getInputProps("date")}
              />
              <TextInput
                required
                label="Label"
                sx={{ flexGrow: 2 }}
                {...modalForm.getInputProps("label")}
              />
            </Group>
            <Radio.Group
              label="Roleplay Word Count Rewards"
              defaultValue="none"
              {...modalForm.getInputProps("rpRewards")}
            >
              <Radio label="None" value="none" />
              <Radio label="Full" value="full" />
              <Radio
                label="Half (RP outside of Adventure Zone or Event)"
                value="half"
              />
            </Radio.Group>
            <Textarea
              autosize
              minRows={3}
              maxRows={10}
              label="Roleplay Post Text / Misc Notes"
              {...modalForm.getInputProps("postText")}
            />
            <Group>
              <Button
                px="xs"
                color="green"
                type="submit"
                disabled={!modalForm.isValid()}
              >
                <Group spacing="xs">
                  <AddIcon />
                  Create Post Summary
                </Group>
              </Button>
              <Button px="xs" color="orange" onClick={cancelModal}>
                <Group spacing="xs">
                  <CancelIcon />
                  Cancel
                </Group>
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <LoadingOverlay visible={!urlNotes} />
      <Stack>
        <Group
          pos="relative"
          position="center"
          sx={{
            alignContent: "center",
          }}
        >
          <Title order={2} align="center">
            Post Summaries
          </Title>
          <div
            css={css`
              position: absolute;
              right: 0;
            `}
          >
            <EditModeToggle checked={editModeOn} onToggle={setEditModeOn} />
          </div>
        </Group>

        <Select
          searchable
          clearable
          sx={{
            flexGrow: 1,
          }}
          itemComponent={UrlNoteSelectItem}
          data={urlNotes.map((n) => ({
            label: `${n.label!} (${
              n.date?.format("YYYY-MMM-DD") ?? "Not Dated"
            })`,
            value: n.url,
          }))}
          value={selectedUrl?.url ?? null}
          onChange={(value) =>
            setSelectedUrl(urlNotes.find((n) => n.url === value))
          }
        />
      </Stack>
      <Space h="md" />
      {selectedUrl && (
        <PostSummary
          urlNote={selectedUrl}
          openCreateModal={() => {
            setCreateModelOpened(true);
          }}
          onUpdate={(newValue) => {
            urlNotesHandler.setItem(
              urlNotes.findIndex((n) => n.id === newValue.id),
              newValue
            );
            setSelectedUrl(newValue);
          }}
          onDelete={(deletedValue) => {
            let newSelection: UrlNote | null;
            urlNotesHandler.setState((prevState) => {
              const newState = prevState.filter(
                (note) => note.id !== deletedValue.id
              );
              newSelection = newState[newState.length - 1] ?? null;
              return newState;
            });
          }}
        />
      )}
      {!selectedUrl && (
        <Stack align={"center"} pb="xl">
          <Title align="center">
            Select a Post Summary
            <Space h="md" />
            OR
          </Title>
          <Button
            sx={{ maxWidth: "20em" }}
            color="green"
            onClick={() => setCreateModelOpened(true)}
          >
            <Group>
              <AddIcon />
              Create New Post Summary
            </Group>
          </Button>
        </Stack>
      )}
    </div>
  );
};

interface UrlNoteSelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  value: string;
}

const UrlNoteSelectItem = forwardRef<HTMLDivElement, UrlNoteSelectItemProps>(
  ({ label, value, ...props }: UrlNoteSelectItemProps, ref) => {
    return (
      <div ref={ref} {...props}>
        <Stack spacing={0}>
          <Title order={5}>{label}</Title>
          <Text>{value}</Text>
        </Stack>
      </div>
    );
  }
);
UrlNoteSelectItem.displayName = "UrlNoteSelectItem";

// noinspection JSUnusedGlobalSymbols
export default PostSummariesPage;