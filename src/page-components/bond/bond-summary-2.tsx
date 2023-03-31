import {
  ActionIcon,
  Anchor,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { BondPokemonInfo } from "~/page-components/bond/bond-pokemon-info";
import { AvatarIconImage } from "~/components";
import { WrapIf } from "~/util";
import { useElementSize } from "@mantine/hooks";
import { useCallback, useMemo } from "react";
import { EditIcon } from "~/appIcons";
import {
  EditBondModalSaveCallback,
  OpenEditBondModal,
} from "~/page-components/bond/edit-bond-modal";
import { BondStylingConfig } from "~/orm/entities";

export interface BondSummary2Props {
  bondInfos: BondPokemonInfo[];
  isEditMode: boolean;
  onSave: EditBondModalSaveCallback;
}

export function BondSummary2({
  bondInfos,
  isEditMode,
  onSave,
}: BondSummary2Props) {
  const { ref, width } = useElementSize();

  const cols = useMemo(() => Math.max(1, Math.floor(width / 250)), [width]);
  const onEditClick = useCallback(
    (bondInfo: BondPokemonInfo) => {
      OpenEditBondModal({
        pokemonUuid: bondInfo.pokemon.uuid,
        bondStylingConfig: bondInfo.bondStylingConfig,
        bondLogs: bondInfo.bondLogs,
        onSave,
      });
    },
    [onSave]
  );

  return (
    <Paper
      sx={{
        backgroundColor: "#252525",
        color: "#ccc",
      }}
    >
      {bondInfos ? (
        <SimpleGrid
          cols={cols}
          ref={ref}
          spacing={"xl"}
          verticalSpacing={"xs"}
          p={"md"}
        >
          {bondInfos.map((bondInfo) => (
            <Box
              key={`${bondInfo.pokemon.uuid}-box`}
              pl={"0.5em"}
              sx={{
                borderLeft: "solid 1px grey",
                borderRadius: "0.125em",
              }}
            >
              <BondSummaryRow
                key={bondInfo.pokemon.uuid}
                bondInfo={bondInfo}
                bondConfig={bondInfo.bondStylingConfig}
                isEditMode={isEditMode}
                onEditClick={onEditClick}
              />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        "No Pokemon"
      )}
    </Paper>
  );
}

interface BondSummaryRowProps {
  bondInfo: BondPokemonInfo;
  bondConfig: BondStylingConfig;
  isEditMode: boolean;
  onEditClick: (bondInfo: BondPokemonInfo) => void;
}

function BondSummaryRow({
  bondInfo,
  bondConfig,
  isEditMode,
  onEditClick,
}: BondSummaryRowProps) {
  return (
    <Group
      key={`${bondInfo.pokemon.uuid}-group`}
      spacing="sm"
      noWrap
      position={"apart"}
    >
      {bondConfig.iconImageLink ? (
        <AvatarIconImage
          key={`${bondInfo.pokemon.uuid}-icon-image`}
          imageLink={bondConfig.iconImageLink}
        />
      ) : (
        <div />
      )}
      <Stack spacing={0}>
        <Text
          key={`${bondInfo.pokemon.uuid}-text`}
          sx={{
            color: bondConfig.colorCode ?? undefined,
            whiteSpace: "pre-line",
          }}
          align="right"
        >
          {`${bondInfo.pokemon.name || "(Unnamed)"} the ${
            bondInfo.pokemon.species || "(Unknown Pokemon)"
          }`}
        </Text>
        <Group noWrap spacing={"xs"}>
          <Text ml="auto">
            {
              <WrapIf
                key={`${bondInfo.pokemon.uuid}-wrap-if-start`}
                wrapIf={!!bondInfo.startLink}
                wrap={(wrapped) => (
                  <Anchor
                    key={`${bondInfo.pokemon.uuid}-link-start`}
                    href={bondInfo.startLink!}
                  >
                    {wrapped}
                  </Anchor>
                )}
              >
                <>{bondInfo.startBond}</>
              </WrapIf>
            }
            {" -> "}
            {
              <WrapIf
                key={`${bondInfo.pokemon.uuid}-wrap-if-end`}
                wrapIf={!!bondInfo.endLink}
                wrap={(wrapped) => (
                  <Anchor
                    key={`${bondInfo.pokemon.uuid}-link-end`}
                    href={bondInfo.endLink!}
                  >
                    {wrapped}
                  </Anchor>
                )}
              >
                <>{bondInfo.endBond}</>
              </WrapIf>
            }
          </Text>
          {isEditMode && (
            <ActionIcon variant="default" onClick={() => onEditClick(bondInfo)}>
              <EditIcon />
            </ActionIcon>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
