import { Prism } from "@mantine/prism";
import { getCircularJsonReplacer } from "~/util";

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
      {JSON.stringify(value ?? "", getCircularJsonReplacer(), 2)}
    </Prism>
  );
}
