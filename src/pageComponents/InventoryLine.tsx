import { ItemLog } from "~/orm/entities";
import {
  Anchor,
  Avatar,
  Box,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { TbAlertTriangle, TbCaretRight, TbPhotoOff } from "react-icons/tb";

export type InventoryLineProps = {
  data: {
    name: string;
    quantity?: number;
    quantityChanges?: {
      change: ItemLog["quantityChange"];
      link: ItemLog["sourceUrl"];
    }[];
    imageLink: string | null;
    description: string | null;
  };
  forceShortForm?: boolean;
};

export function InventoryLine({
  data,
  forceShortForm = false,
}: InventoryLineProps) {
  const shortForm =
    forceShortForm ||
    typeof data.quantity === "undefined" ||
    !data.quantityChanges ||
    (data.quantity === 1 && data.quantityChanges.length === 1);
  const error =
    typeof data.quantity !== "undefined" ? data.quantity < 0 : false;
  const nameComp = (
    <Text weight={500} underline>
      {data.name}
    </Text>
  );
  return (
    <Group
      noWrap
      key={`line-${data.name}`}
      spacing="xs"
      sx={{
        lineHeight: "normal",
        "& > *": error ? { color: "red" } : {},
      }}
    >
      <Box>
        {error ? (
          <ThemeIcon size="sm" radius="xl" color="red" variant="filled">
            <TbAlertTriangle />
          </ThemeIcon>
        ) : (
          <TbCaretRight />
        )}
      </Box>
      <Stack spacing="0">
        <Group spacing="0">
          <>
            {shortForm ? "" : <Text mr="0.2em">{`x${data.quantity}`}</Text>}
            {data.imageLink && (
              <Avatar
                mr="0.2em"
                sx={{ display: "inline-block", verticalAlign: "sub" }}
                radius="xs"
                size="sm"
                src={data.imageLink}
              >
                <TbPhotoOff size="100%" />
              </Avatar>
            )}
            {shortForm ? (
              data.quantityChanges?.[0]?.link ? (
                <Anchor href={data.quantityChanges[0].link}>{nameComp}</Anchor>
              ) : (
                nameComp
              )
            ) : (
              <>
                {nameComp}
                <Text ml="0.5em">
                  (
                  {(data.quantityChanges ?? []).map((qc, i) => (
                    <>
                      {i > 0 && ", "}
                      {qc.link ? (
                        <Anchor href={qc.link}>
                          {qc.change >= 0 && "+"}
                          {qc.change}
                        </Anchor>
                      ) : (
                        <>
                          {qc.change >= 0 && "+"}
                          {qc.change}
                        </>
                      )}
                    </>
                  ))}
                  )
                </Text>
              </>
            )}
          </>
        </Group>
        {data.description && <Text>{data.description}</Text>}
      </Stack>
    </Group>
  );
}
