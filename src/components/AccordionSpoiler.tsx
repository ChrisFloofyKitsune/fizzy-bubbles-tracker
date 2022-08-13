import { ReactNode, useEffect, useState } from "react";
import { Accordion } from "@mantine/core";

export interface AccordionSpoilerProps {
  label: ReactNode;
  children: ReactNode[] | ReactNode;
  startOpen?: boolean;
  disabled?: boolean;
}
export function AccordionSpoiler({
  label,
  children,
  startOpen = false,
  disabled = false,
}: AccordionSpoilerProps) {
  const [accordionState, setAccordionState] = useState<string | null>(
    startOpen ? "inner" : null
  );

  useEffect(() => {
    if (disabled) setAccordionState(null);
  }, [disabled]);

  return (
    <Accordion
      value={accordionState}
      onChange={setAccordionState}
      variant="separated"
      radius="lg"
      styles={(theme) => ({
        control: {
          backgroundColor: theme.colors.dark[4],
          border: "1px solid " + theme.colors.dark[2],
          borderRadius: "inherit",
          transitionDuration: "0.25s",
          "[data-active] &": {
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
          },
          ":hover": {
            backgroundColor: theme.fn.lighten(theme.colors.dark[4], 0.1),
          },
        },
        content: {
          padding: "1em",
        },
      })}
    >
      <Accordion.Item value="inner">
        <Accordion.Control disabled={disabled}>{label}</Accordion.Control>
        <Accordion.Panel>{<>{children}</>}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
