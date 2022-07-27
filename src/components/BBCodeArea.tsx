import { TypographyStylesProvider } from "@mantine/core";
import BBCodeParser from "~/BBCodeUpn";

export type BBCodeAreaProps = {
  label?: string;
  bbCode: string;
  stickyLabel?: boolean;
};

export const BBCodeArea = ({ label, bbCode, stickyLabel }: BBCodeAreaProps) => {
  return (
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
      <div dangerouslySetInnerHTML={{ __html: BBCodeParser.parse(bbCode) }} />
    </TypographyStylesProvider>
  );
};
