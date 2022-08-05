import { ItemLog } from "~/orm/entities";
import { createStyles, ThemeIcon, Tooltip } from "@mantine/core";
import { TbAlertTriangle, TbCaretRight } from "react-icons/tb";
import { ReactNode, useMemo } from "react";
import { ItemDefinitionImage } from "~/pageComponents/items/ItemDefinitionImage";
import { WrapIf } from "~/util";

export type InventoryLineProps = {
  data: {
    id: number;
    name: string;
    quantity?: number;
    quantityChanges?: {
      change: ItemLog["quantityChange"];
      link: ItemLog["sourceUrl"];
      tooltipLabel?: ReactNode;
    }[];
    imageLink: string | null;
    description: string | null;
  };
  forceShortForm?: boolean;
};

const useInvLineStyle = createStyles((theme, error: boolean) => ({
  line: {
    padding: "0.5em",
    display: "flex",
    alignItems: "center",
    gap: "0.25em",
    flexWrap: "nowrap",
    lineHeight: "normal",
    color: error ? "red" : "",
    "& a": {
      color: "#4dabf7",
      ":hover": {
        textDecoration: "underline",
      },
    },
  },
  icon: {
    display: "flex",
  },
}));

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

  const nameComp = useMemo(
    () => (
      <span
        key={`line-${data.id}-name`}
        style={{
          fontWeight: 500,
          textDecoration: "underline",
        }}
      >
        {data.name}
      </span>
    ),
    [data.id, data.name]
  );

  const styles = useInvLineStyle(error);

  return (
    <div key={`line-${data.id}-group-main`} className={styles.classes.line}>
      <div key={`line-${data.id}-icon-div`} className={styles.classes.icon}>
        {error && (
          <ThemeIcon
            key={`line-${data.id}-icon-wrap`}
            size="sm"
            radius="xl"
            color="red"
            variant="filled"
          >
            <TbAlertTriangle key={`line-${data.id}-icon-alert`} />
          </ThemeIcon>
        )}
        {!error && <TbCaretRight key={`line-${data.id}-icon-normal`} />}
      </div>
      <div
        key={`line-${data.id}-stack`}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          key={`line-${data.id}-group-inner-top`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25em",
          }}
        >
          {!shortForm && (
            <span key={`line-${data.id}-quantity`}>{`x${data.quantity}`}</span>
          )}
          {data.imageLink && (
            <ItemDefinitionImage imageSource={data.imageLink} />
          )}
          {shortForm ? (
            <WrapIf
              key={`line-${data.id}-link-if`}
              wrapIf={!!data.quantityChanges?.[0]?.link}
              wrap={(wrapped) => (
                <a
                  key={`line-${data.id}-link`}
                  href={data.quantityChanges![0]!.link!}
                >
                  {wrapped}
                </a>
              )}
            >
              <WrapIf
                key={`line-${data.id}-tooltip-if`}
                wrapIf={!!data.quantityChanges?.[0]?.tooltipLabel}
                wrap={(wrapped) => (
                  <Tooltip
                    key={`line-${data.id}-tooltip`}
                    label={data.quantityChanges![0]!.tooltipLabel}
                  >
                    {wrapped}
                  </Tooltip>
                )}
              >
                {nameComp}
              </WrapIf>
            </WrapIf>
          ) : (
            <>
              {nameComp}
              <span key={`line-${data.id}-qc-text`}>
                (
                {(data.quantityChanges ?? []).map((qc, i) => (
                  <>
                    {i > 0 && (
                      <span key={`line-${data.id}-qc-${i}-comma`}>{", "}</span>
                    )}
                    <WrapIf
                      key={`line-${data.id}-qc-"${i}-link-if"`}
                      wrapIf={!!qc.link}
                      wrap={(child) => (
                        <a
                          key={`line-${data.id}-qc-"${i}-link"`}
                          href={qc.link!}
                        >
                          {child}
                        </a>
                      )}
                    >
                      <WrapIf
                        key={`line-${data.id}-qc-"${i}-tooltip-if"`}
                        wrapIf={!!qc.tooltipLabel}
                        wrap={(child) => (
                          <Tooltip
                            key={`line-${data.id}-qc-"${i}-tooltip"`}
                            label={qc.tooltipLabel!}
                          >
                            {child}
                          </Tooltip>
                        )}
                      >
                        <span key={`line-${data.id}-qc-"${i}-change"`}>
                          {qc.change >= 0 && "+"}
                          {qc.change}
                        </span>
                      </WrapIf>
                    </WrapIf>
                  </>
                ))}
                )
              </span>
            </>
          )}
        </div>
        {data.description && (
          <span key={`line-${data.id}-desc`}>{data.description}</span>
        )}
      </div>
    </div>
  );
}
