import { Pokemon } from "~/orm/entities";

export function createBlankPokemon(): Pokemon {
  return Object.assign(new Pokemon(), {
    name: "",
    species: "",
    dexNum: "",
    levelLogs: [],
    bondLogs: [],
    levelUpMoves: [],
    eggMoveLogs: [],
    machineMoveLogs: [],
    tutorMoveLogs: [],
    otherMoveLogs: [],
    contestStatsLogs: [],
    specialStatuses: [],
  });
}
