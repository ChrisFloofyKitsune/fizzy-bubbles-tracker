import { Group, SimpleGrid, Stack, Text, Textarea, Title } from "@mantine/core";
import { NextPage } from "next";
import { BBCodeArea } from "~/components";
import { useDataSource } from "~/services";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAsyncEffect } from "use-async-effect";
import { MiscValue } from "~/orm/entities/miscValue";
import { debounce } from "~/util";
import { Repository } from "typeorm";
import { countWordsInBBCode } from "~/util/wordCountUtil";
import { PokeDollarIcon } from "~/appIcons";

const WordCounterPage: NextPage = () => {
  const ds = useDataSource();
  const [repo, setRepo] = useState<Repository<MiscValue>>();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>();
  const [wordCount, setWordCount] = useState<number>(0);

  useEffect(() => {
    if (ds) {
      setRepo(ds.getRepository(MiscValue));
    }
  }, [ds]);

  useAsyncEffect(async () => {
    if (!repo || !textAreaRef.current) return;

    const dbValue = await repo.findOneBy({ key: "word counter" });
    textAreaRef.current.value = dbValue?.value ?? "";
    setText(textAreaRef.current.value);
  }, [repo, textAreaRef.current]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onTextChange = useCallback(
    debounce((newText: string) => {
      setText(newText);
      if (!repo) return;
      repo.save({ key: "word counter", value: newText }).then();
    }, 250),
    [repo]
  );

  useEffect(() => {
    setWordCount(text ? countWordsInBBCode(text.trim()) : 0);
  }, [text]);

  return (
    <Stack>
      <Title>Word Counter</Title>
      <SimpleGrid
        cols={1}
        spacing="lg"
        breakpoints={[{ minWidth: "md", cols: 2 }]}
        sx={{
          "& > *": {
            minHeight: "20em",
          },
        }}
      >
        <Textarea
          ref={textAreaRef}
          styles={{
            input: {
              resize: "vertical",
            },
          }}
          autosize
          minRows={15}
          maxRows={30}
          onChange={(event) => {
            onTextChange(event.currentTarget.value);
          }}
        />
        <BBCodeArea
          label={
            <Group sx={{ fontSize: "150%" }}>
              <Text>{`${wordCount} Words`}</Text>
              <Text>
                <PokeDollarIcon
                  size="1em"
                  style={{ verticalAlign: "text-bottom" }}
                />
                {`${
                  wordCount < 150
                    ? 0
                    : Math.min(
                        500,
                        150 + Math.floor((wordCount - 150) / 25) * 25
                      )
                }`}
              </Text>
            </Group>
          }
          bbCode={text ?? ""}
          stickyLabel={true}
        />
      </SimpleGrid>
    </Stack>
  );
};

// noinspection JSUnusedGlobalSymbols
export default WordCounterPage;
