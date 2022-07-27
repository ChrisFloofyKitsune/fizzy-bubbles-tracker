import {NextPage} from "next";
import {useDataSource} from "~/services";
import {ObjectLiteral} from "typeorm";
import {Pokemon} from "~/orm/entities";
import {useEffect, useState} from "react";
import {BBCodeFromTemplate} from "~/components";
import {PokemonGenderOptions} from "~/orm/enums";

const TestPage: NextPage = () => {

    const ds = useDataSource();
    const [testEntity, setTestEntity] = useState<ObjectLiteral>();

    useEffect(() => {
        if (!ds) return;
        const _repo = ds.getRepository(Pokemon);
        // @ts-ignore
        setTestEntity(_repo.create({
            name: "Chris",
            species: "Swampert",
            dexNum: "a number",
            gender: PokemonGenderOptions.MALE,
            obtained: 'Starter',
            type: 'Water / Ground',
            ability: 'idk',
            nature: 'brash',
            levelLogs: [
                {
                    newValue: 100,
                    sourceUrl: ''
                }
            ],
            pokeball: 'Pokeball',
            pokeballLink: 'adfsghjk',
            boutiqueMods: 'none',
            boutiqueModsLink: '',
            evolutionStageOne: 'baby',
            evolutionStageTwoMethod: 'age',
            evolutionStageTwo: 'teen',
            evolutionStageThreeMethod: 'maturity',
            evolutionStageThree: 'MAN'

        }));
    }, [ds]);


    return <>
        {!testEntity ? <>AAA</> :
            <BBCodeFromTemplate
                entityObject={testEntity}
                entityObjectClassName={"Pokemon"}
            />
        }
    </>;
};

export default TestPage;