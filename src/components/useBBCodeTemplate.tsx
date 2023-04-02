import { useRepository } from "~/services";
import { BBCodeReplacementConfig } from "~/orm/entities";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "use-async-effect";
import { Like, ObjectLiteral } from "typeorm";

type ApplyBBCodeTemplateFunc<T extends ObjectLiteral> = (
  object: T,
  replacementSettings?: Record<string, any>
) => string | null;
export function useBBCodeTemplate<T extends ObjectLiteral>(
  templateIdentifier: string,
  templateConfigs?: BBCodeReplacementConfig[]
): ApplyBBCodeTemplateFunc<T> {
  const repo = useRepository(BBCodeReplacementConfig);
  const [baseTemplate, setBaseTemplate] =
    useState<BBCodeReplacementConfig | null>();
  const [templateData, setTemplateData] =
    useState<Record<string, BBCodeReplacementConfig>>();

  useAsyncEffect(async () => {
    if (!repo && !templateConfigs) return;

    let configs: BBCodeReplacementConfig[];
    if (templateConfigs) {
      configs = templateConfigs;
    } else if (repo) {
      configs = await repo.findBy({
        specifier: Like(`${templateIdentifier}%`),
      });
    } else {
      throw new Error(
        `No configs given or found for ${templateIdentifier} in database.`
      );
    }

    let baseResult: typeof baseTemplate = null;
    const result: typeof templateData = {};
    for (const config of configs) {
      const replacementTarget = config.specifier.split(".")[1];
      if (!replacementTarget) {
        baseResult = config;
      } else {
        result[replacementTarget] = config;
      }
    }
    setBaseTemplate(baseResult);
    setTemplateData(result);
  }, [repo, templateIdentifier, templateConfigs]);

  return useCallback(
    (object: T, replacementSettings?: Record<string, any>) => {
      if (!templateData) return null;

      if (!baseTemplate) {
        return `ERR: No base template config found for ${templateIdentifier}`;
      }

      if (
        (baseTemplate.customTemplate || baseTemplate.customTemplateDefault) ===
          null &&
        baseTemplate.replaceWithProperty === null
      ) {
        return `ERR: Base template must have "customTemplate" or "replaceWithProperty" set in order to get things started!!`;
      }

      let result: string =
        (baseTemplate.customTemplate || baseTemplate.customTemplateDefault) ??
        object[baseTemplate.replaceWithProperty!].toString() ??
        "";

      let foundTargets = new Set();
      let findRegex = /{{[^\s{}]+}}/gm;
      const maxIterationCount = 100;
      let iterationCount = 0;
      let execArray = findRegex.exec(result);
      while (iterationCount < maxIterationCount && execArray) {
        for (const execResult of execArray) {
          const targetProp = execResult.slice(2, -2);
          // console.debug(targetProp);
          foundTargets.add(targetProp);
          const config = templateData[targetProp];
          let targetResult: any | null = null;
          if (!config) {
            targetResult = object[targetProp] ?? null;
            if (typeof targetResult === "function") {
              targetResult = (targetResult as Function).call(
                object,
                replacementSettings
              );
            }
          } else {
            const {
              replaceWithProperty,
              customTemplate,
              customTemplateDefault,
            } = config;
            targetResult =
              (replaceWithProperty
                ? object[replaceWithProperty]?.toString()
                : customTemplate || customTemplateDefault) ?? null;
          }
          if (targetResult === null) {
            targetResult = "";
          }
          result = result.replaceAll(execResult, String(targetResult));
        }
        findRegex = new RegExp(
          `{{[^\\s{}]+(?<!${Array.from(foundTargets).join("|")})}}`,
          "gm"
        );
        execArray = findRegex.exec(result);
        iterationCount++;
      }

      if (iterationCount >= maxIterationCount) {
        throw new Error("Hit max iteration count somehow!!");
      }

      return result;
    },
    [baseTemplate, templateData, templateIdentifier]
  );
}
