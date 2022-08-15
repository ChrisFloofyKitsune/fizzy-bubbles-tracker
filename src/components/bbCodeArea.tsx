import {
  Box,
  Tooltip,
  TypographyStylesProvider,
  ActionIcon,
} from "@mantine/core";

import BBCodeParser from "~/BBCodeUpn";
import { useMemo } from "react";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import { CopyIcon } from "~/components/CopyIcon";
import { TbCode, TbCodeOff } from "react-icons/tb";

export type BBCodeAreaProps = {
  label?: string;
  bbCode: string;
  stickyLabel?: boolean;
};
export const BBCodeArea = ({ label, bbCode, stickyLabel }: BBCodeAreaProps) => {
  const parsedBBCode = useMemo(() => BBCodeParser.parse(bbCode), [bbCode]);
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
        <TypographyStylesProvider
          sx={{
            border: "#444 solid 1px",
            borderRadius: "0.5em",
            padding: "0.5em",
            backgroundColor: "#252525",
            color: "#ccc",
            fontSize: "10pt!important",
            fontFamily:
              'verdana, geneva, lucida, "lucida grande", arial, helvetica, sans-serif',
            lineHeight: "normal",
            a: {
              color: "white",
              "&:hover": {
                color: "#898989",
                textDecoration: "none",
              },
            },
            ".smallfont": {
              fontSize: "11px",
            },
            hr: {
              display: "block",
              unicodeBidi: "isolate",
              marginBlockStart: "0.5em",
              marginBlockEnd: "0.5em",
              marginInlineStart: "auto",
              marginInlineEnd: "auto",
              overflow: "hidden",
              borderStyle: "inset",
              borderWidth: "1px",
              borderBottomWidth: "0px",
            },
            ".bbCodeLabel": !stickyLabel
              ? {}
              : {
                  position: "sticky",
                  top: "0px",
                  backgroundColor: "#252525",
                },
          }}
        >
          {!label ? (
            ""
          ) : (
            <div className="bbCodeLabel">
              <div className="smallfont">
                <strong>{label}</strong>
              </div>
              <hr />
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: parsedBBCode }} />
        </TypographyStylesProvider>
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
          {bbCode}
        </Prism>
      )}
    </Box>
  );
};
