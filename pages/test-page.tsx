import { NextPage } from "next";
import { useDataSource } from "~/services";
import { ObjectLiteral } from "typeorm";
import { ItemDefinition, ItemLog, Pokemon } from "~/orm/entities";
import { useEffect, useMemo, useState } from "react";
import { BBCodeFromTemplate } from "~/components";
import { PokemonGenderOptions } from "~/orm/enums";
import {
  extractRange,
  fileToWorkBook,
  extractInventory,
  sheetRefToNameAndRange,
  extractWallet,
  extractPokemonSheet,
  findPokemonSheets,
} from "~/spreadsheetFileUtil";
import { Button, FileButton, Title, Text, Select } from "@mantine/core";
import { TbTableImport } from "react-icons/tb";
import { Prism } from "@mantine/prism";
import { WorkBook } from "xlsx";
import { getCircularReplacer } from "~/util";
import { openContextModal } from "@mantine/modals";
import { ModalName } from "~/modalsList";

const TestPage: NextPage = () => {
  const ds = useDataSource();

  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);

  const namedRanges = useMemo(
    () => workbook?.Workbook?.Names ?? [],
    [workbook]
  );

  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [sheet, range] = useMemo(
    () => (selectedRef ? sheetRefToNameAndRange(selectedRef) : [null, null]),
    [selectedRef]
  );

  const logsAndDefs = useMemo(
    () => (workbook ? extractInventory(workbook) : []),
    [workbook]
  );

  const walletLogs = useMemo(
    () => (workbook ? extractWallet(workbook) : []),
    [workbook]
  );

  const annahimeSheet = useMemo(
    () =>
      workbook ? extractPokemonSheet(workbook, "Annahime the Ninetales") : "",
    [workbook]
  );

  return (
    <>
      <Button
        onClick={() => {
          openContextModal({
            modal: ModalName.ImportSpreadsheet,
            size: "xl",
            innerProps: {},
          });
        }}
      >
        OPEN IMPORT MODAL
      </Button>

      <FileButton
        onChange={async (file) => {
          setSpreadsheetFile(file);
          if (file) {
            const wb = await fileToWorkBook(file);
            setWorkbook(wb);
          }
        }}
      >
        {(props) => (
          <Button {...props} ml="md" leftIcon={<TbTableImport size={20} />}>
            Import Spreadsheet
          </Button>
        )}
      </FileButton>

      <Title order={4}>Workbook Sheets</Title>
      <PrismJSON value={workbook ? workbook.SheetNames : ""} />

      <Title order={4}>Workbook Named Ranges</Title>
      <Select
        data={namedRanges.map((n) => ({
          label: `${n.Name} ${n.Ref}`,
          value: n.Ref,
        }))}
        value={selectedRef}
        onChange={setSelectedRef}
      />
      <PrismJSON
        value={workbook && sheet ? extractRange(workbook, sheet, range) : ""}
      />

      <Title order={4}>Pokemon Sheets</Title>
      <PrismJSON value={workbook ? findPokemonSheets(workbook) : ""} />

      <Title order={4}>{"ANNAHIME! <3"}</Title>
      <PrismJSON value={annahimeSheet} />
    </>
  );
};

function PrismJSON({ value }: { value: any }) {
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

export default TestPage;
