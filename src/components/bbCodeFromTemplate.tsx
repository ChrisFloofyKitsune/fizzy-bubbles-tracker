import { useMemo, useState } from 'react';
import { Like, ObjectLiteral } from "typeorm";
import { useDataSource } from '~/services';
import { BBCodeReplacementConfig } from "~/orm/entities";
import useAsyncEffect from 'use-async-effect';
import { BBCodeArea } from './bbCodeArea';

export type BBCodeFromTemplateProps<T extends ObjectLiteral> = {
    entityObject: T;
    entityObjectClassName: string;
    bbCodeAreaProps?: { label?: string, stickyLabel?: boolean }
}
export function BBCodeFromTemplate<T extends ObjectLiteral>({
    entityObject,
    entityObjectClassName,
    bbCodeAreaProps
}: BBCodeFromTemplateProps<T>) {

    const ds = useDataSource();
    const [baseTemplate, setBaseTemplate] = useState<BBCodeReplacementConfig | null>();
    const [templateData, setTemplateData] = useState<Record<string, BBCodeReplacementConfig>>();

    useAsyncEffect(async () => {
        if (!ds || !entityObject) return;
        
        const configs = await ds.getRepository(BBCodeReplacementConfig).findBy({
            specifier: Like(`${entityObjectClassName}%`)
        });

        let baseResult: typeof baseTemplate = null;
        const result: typeof templateData = {};
        for (const config of configs) {
            const replacementTarget = config.specifier.split('.')[1];
            if (!replacementTarget) {
                baseResult = config;
            } else {
                result[replacementTarget] = config;
            }
        }
        setBaseTemplate(baseResult);
        setTemplateData(result);
    }, [ds, entityObjectClassName]);

    const bbCodeOutput: string | null = useMemo(() => {
        //stuff's not loaded yet
        if (!templateData) return null;

        if (!baseTemplate) {
            return `ERR: No base template config found for ${entityObjectClassName}`;
        }

        if (baseTemplate.customTemplate === null && baseTemplate.replaceWithProperty === null) {
            return `ERR: Base template must have "customTemplate" or "replaceWithProperty" set in order to get things started!!`;
        }

        let result: string = baseTemplate.customTemplate
            ?? entityObject[baseTemplate.replaceWithProperty!].toString()
            ?? '';
        
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
                let targetResult: string | null = null;
                if (!config) {
                    targetResult = entityObject[targetProp]?.toString() ?? null;
                } else {
                    const {replaceWithProperty, customTemplate} = config;
                    targetResult = (replaceWithProperty ? entityObject[replaceWithProperty]?.toString() : customTemplate) ?? null;
                }
                if (targetResult !== null) {
                    result = result.replaceAll(execResult, targetResult);
                }
            }
            findRegex = new RegExp(`{{[^\\s{}]+(?<!${Array.from(foundTargets).join('|')})}}`, 'gm');
            execArray = findRegex.exec(result);
            iterationCount++;
        }
        // console.log(foundTargets);
        if (iterationCount >= maxIterationCount) {
            throw new Error("Hit max iteration count somehow!!");
        }

        return result;

    }, [baseTemplate, templateData, entityObject, entityObjectClassName]);

    return (bbCodeOutput === null) ?
        <>Loading...</> :
        <BBCodeArea
            bbCode={bbCodeOutput}
            {...bbCodeAreaProps}
        />;
}