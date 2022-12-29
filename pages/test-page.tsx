import { NextPage } from "next";
import { PrismJSON } from "~/components/prismJson";
import { useState } from "react";
import { useFizzyDex } from "~/services/FizzyDexService";
import { FizzyDexPokemonSelect } from "~/components/FizzyDexPokemonSelect";
import { FizzyDex, Form, Pokemon } from "fizzydex.js";

import { Button } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { ModalName } from "~/modalsList";

const TestPage: NextPage = () => {
  const fizzyDex = useFizzyDex();

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  return (
    <>
      Secwet tewst page OwO
      <FizzyDexPokemonSelect
        pokemonSelection={selectedPokemon}
        onPokemonSelect={setSelectedPokemon}
        formSelection={selectedForm}
        onFormSelect={setSelectedForm}
        clearable
      />
      <PrismJSON value={selectedPokemon} />
      <PrismJSON value={selectedForm} />
      <PrismJSON
        value={FizzyDex.Data.PokemonMoveList?.find((l) => l.Name === "Vulpix")}
      />
      <Button
        onClick={() =>
          openContextModal({
            modal: ModalName.PokemonImportFromFizzyDex,
            title: "Import from FizzyDex test",
            size: "xl",
            innerProps: {},
          })
        }
      />
    </>
  );
};

export default TestPage;
