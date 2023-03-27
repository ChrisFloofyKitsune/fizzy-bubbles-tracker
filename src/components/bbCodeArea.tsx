import { ActionIcon, Box, Tooltip } from "@mantine/core";

import BBCodeParser from "~/bbcode/BBCodeUpn";
import { Fragment, ReactNode, useMemo } from "react";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import { CopyIcon } from "~/components/CopyIcon";
import { TbCode, TbCodeOff } from "react-icons/tb";
import { UpnBBCodeStyling } from "~/components/UpnBBCodeStyling";

export type BBCodeAreaProps = {
  label?: ReactNode;
  bbCode: string | Record<string, string>;
  stickyLabel?: boolean;
};

export const BBCodeArea = ({ label, bbCode, stickyLabel }: BBCodeAreaProps) => {
  const [showBBCode, showBBCodeHandler] = useDisclosure(false);
  const clipboard = useClipboard();

  return (
    <Box sx={{ position: "relative" }}>
      <Tooltip
        label={showBBCode ? "Show Preview" : "Show BBCode"}
        position="top-end"
        withArrow
        arrowSize={6}
        offset={6}
      >
        <ActionIcon
          sx={(theme) => ({
            position: "absolute",
            top: theme.spacing.xs,
            right: theme.dir === "ltr" ? theme.spacing.xs + 32 : "unset",
            left: theme.dir === "rtl" ? theme.spacing.xs + 32 : "unset",
            zIndex: 2,
          })}
          aria-label={showBBCode ? "Show Preview" : "Show BBCode"}
          onClick={() => showBBCodeHandler.toggle()}
          variant={showBBCode ? "filled" : "default"}
        >
          {showBBCode ? <TbCodeOff /> : <TbCode />}
        </ActionIcon>
      </Tooltip>
      <Tooltip
        label={clipboard.copied ? "Copied" : "Copy BBCode"}
        position="top-end"
        withArrow
        arrowSize={6}
        offset={6}
        color={clipboard.copied ? "teal" : undefined}
      >
        <ActionIcon
          sx={(theme) => ({
            position: "absolute",
            top: theme.spacing.xs,
            right: theme.dir === "ltr" ? theme.spacing.xs : "unset",
            left: theme.dir === "rtl" ? theme.spacing.xs : "unset",
            zIndex: 2,
          })}
          aria-label={clipboard.copied ? "Copied" : "Copy BBCode"}
          onClick={() => clipboard.copy(bbCode)}
          variant="default"
        >
          <CopyIcon copied={clipboard.copied} />
        </ActionIcon>
      </Tooltip>
      {!showBBCode ? (
        <UpnBBCodeStyling label={label} stickyLabel={stickyLabel}>
          {typeof bbCode === "string" ? (
            <BBCodeSection key="bbCodeSection" bbCode={bbCode} />
          ) : typeof bbCode === "object" ? (
            Object.entries(bbCode).map(([key, bbCode], index, array) => (
              <Fragment key={`${key}_fragment`}>
                <BBCodeSection key={key} bbCode={bbCode} />
                {index !== array.length - 1 ? (
                  <br key={`${key}_linebreak`} />
                ) : null}
              </Fragment>
            ))
          ) : (
            "something went wrong"
          )}
        </UpnBBCodeStyling>
      ) : (
        <Prism
          language={"bbcode" as any}
          noCopy
          sx={{
            'code[class*="language-"], pre[class*="language-"]': {
              paddingTop: label ? "2.6em" : "",
              whiteSpace: "normal",
              wordBreak: "break-word",
              lineHeight: "normal",
              fontSize: "10.5pt",
            },
          }}
        >
          {typeof bbCode === "string"
            ? bbCode
            : typeof bbCode === "object"
            ? Object.values(bbCode).join("\n\n")
            : "something went wrong"}
        </Prism>
      )}
    </Box>
  );
};

function BBCodeSection({ bbCode }: { bbCode: string }) {
  const parsedBBCode = useMemo(
    () => BBCodeParser.parse(bbCode) + "\n",
    [bbCode]
  );
  return <div dangerouslySetInnerHTML={{ __html: parsedBBCode }} />;
}
