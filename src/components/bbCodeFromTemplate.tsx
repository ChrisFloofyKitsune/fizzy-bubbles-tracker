import { useMemo } from "react";
import { ObjectLiteral } from "typeorm";
import { BBCodeArea } from "./bbCodeArea";
import { useBBCodeTemplate } from "~/components/useBBCodeTemplate";

export type BBCodeFromTemplateProps<T extends ObjectLiteral> = {
  entityObject: T;
  entityObjectClassName: string;
  replacementSettings?: Record<string, any>;
  bbCodeAreaProps?: { label?: string; stickyLabel?: boolean };
};
export function BBCodeFromTemplate<T extends ObjectLiteral>({
  entityObject,
  entityObjectClassName,
  replacementSettings = {},
  bbCodeAreaProps,
}: BBCodeFromTemplateProps<T>) {
  const applyBBCodeTemplate = useBBCodeTemplate(entityObjectClassName);

  const bbCodeOutput = useMemo(
    () => applyBBCodeTemplate(entityObject, replacementSettings),
    [applyBBCodeTemplate, entityObject, replacementSettings]
  );

  return bbCodeOutput === null ? (
    <>Loading...</>
  ) : (
    <BBCodeArea bbCode={bbCodeOutput} {...bbCodeAreaProps} />
  );
}
