import { Prism } from "@mantine/prism";
import { getCircularReplacer } from "~/util";

export function PrismJSON({ value }: { value: any }) {
  return (
    <Prism
      language={"json"}
      styles={{
        scrollArea: {
          ".mantine-ScrollArea-viewport": {
            maxHeight: "50vh",
          },
        },
      }}
    >
      {JSON.stringify(value ?? "", getCircularReplacer(), 2)}
    </Prism>
  );
}
