import {
  Anchor,
  createStyles,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDocumentTitle, useIsomorphicEffect } from "@mantine/hooks";
import { ActiveLink } from "./activeLink";
import { NavOptionList } from "~/navOptions";

const borderRadius = {
  normal: "1em",
  hover: "0.5em",
};
const transitionTime = "0.25s";

const useStyles = createStyles((theme) => ({
  Link: {
    borderRadius: borderRadius.normal,
    transition: transitionTime,

    ".mantine-ThemeIcon-root": {
      borderRadius: borderRadius.normal,
      transition: transitionTime,
      "& > svg": {
        transition: transitionTime,
      },
    },
    ".mantine-Group-root": {
      borderRadius: borderRadius.normal,
      transition: transitionTime,
      flexWrap: "nowrap",
    },

    "&:hover": {
      borderRadius: borderRadius.hover,
      ".mantine-ThemeIcon-root": {
        borderRadius: borderRadius.hover,
        transform: "translate(0, -3px)",
      },
      ".mantine-Group-root": {
        borderRadius: borderRadius.hover,
        backgroundColor: theme.fn.rgba("#FFF", 0.1),
      },
    },

    "&.active": {
      backgroundColor: theme.colors.teal[9],
      ".mantine-ThemeIcon-root": {
        backgroundColor: theme.colors.red[9],
      },
      ".mantine-Text-root": {
        fontWeight: "bolder",
      },
    },
  },
}));

export const AppNavbar = () => {
  const [title, setTitle] = useState("TEST THING");
  useDocumentTitle(title);

  const router = useRouter();
  useIsomorphicEffect(() => {
    const currentNavOpt = NavOptionList.find(
      (opt) => opt.path === router.asPath
    );
    setTitle(currentNavOpt ? currentNavOpt.pageName : "404 or something idk");
  }, [router.asPath]);

  const { classes, cx } = useStyles();
  const navOptClasses: Record<string, string> = {};

  for (const opt of NavOptionList) {
    navOptClasses[opt.pageName] = opt.useStyle().classes.className;
  }

  return (
    <Stack
      sx={{
        height: "100%",
      }}
    >
      {NavOptionList.map((opt) => {
        return (
          <Anchor component={ActiveLink} href={opt.path} key={opt.pageName}>
            <a
              id={opt.pageName}
              className={cx(classes.Link, navOptClasses[opt.pageName])}
            >
              <Group>
                <ThemeIcon sx={{ height: "3em", width: "3em" }}>
                  <opt.icon size="3em" />
                </ThemeIcon>
                <Text>{opt.pageName}</Text>
              </Group>
            </a>
          </Anchor>
        );
      })}
    </Stack>
  );
};
