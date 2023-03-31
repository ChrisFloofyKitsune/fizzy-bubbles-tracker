import { useMemo, useState } from "react";
import { BBCodeReplacementConfig, LevelUpMove, Pokemon } from "~/orm/entities";
import { usePokemonBBCodeTemplate } from "~/bbcode/usePokemonBBCodeTemplate";
import { BBCodeArea } from "~/components";
import { PokemonContestStat } from "~/orm/enums";
import {
  useAutoSaveCounter,
  useRepository,
  waitForTransactions,
} from "~/services";
import { useAsyncEffect } from "use-async-effect";
import { Like } from "typeorm";
import { LocalDate, ZoneId } from "@js-joda/core";

const examplePokemon: Pokemon = Object.assign(new Pokemon(), {
  uuid: "fizzy-bot-pikachu",
  trainerId: null,
  name: "Fizzypedia Bot",
  gender: "Female",
  type: "Electric",
  ability: "Lightning Rod",
  nature: "Modest",
  subHeading: 'Everyone: "@Sniz the bot is down"',
  species: "Ph. D Pikachu",
  dexNum: "25",
  imageLink: "https://veekun.com/dex/media/pokemon/global-link/25-phd.png",
  obtained: "[s]Coding Hell[/s] Hatched?",
  pokeball: "Yellow Cyber Ball",
  heldItem: "The FizzyDex",
  levelLogs: [
    {
      value: 20,
    } as any,
  ],
  bondLogs: [
    {
      value: 9,
      date: LocalDate.now(ZoneId.UTC),
    } as any,
  ],
  boutiqueMods: "-",
  evolutionStageOne: "Testy Bot",
  evolutionStageTwoMethod: "Development Time",
  evolutionStageTwo: "Fizzypedia Bot",
  description:
    "Did you know that [u][b]you can include BBCode not only in the description[/b][/u] but pretty much anywhere else you can include text?",
  contestStatsLogs: [
    {
      id: 1,
      stat: PokemonContestStat.ALL,
      statChange: 10,
    },
    {
      id: 2,
      stat: PokemonContestStat.CLEVER,
      statChange: 40,
    },
    {
      id: 3,
      stat: PokemonContestStat.TOUGH,
      statChange: 5,
    },
  ] as any,
  levelUpMoves: `- Electric Terrain
    1 Charm
    1 Growl
    1 Nasty Plot
    1 Nuzzle
    1 Play Nice
    1 Quick Attack
    1 Sweet Kiss
    1 Tail Whip
    1 Thunder Shock
    4 Thunder Wave
    8 Double Team
    9 Double Kick
    12 Electro Ball
    15 Swift
    16 Feint
    18 Light Screen
    20 Slam
    20 Spark
    21 Thunderbolt
    24 Agility
    30 Thunder
    32 Discharge
    37 Iron Tail
    50 Wild Charge`
    .split("\n")
    .map((line) => {
      const parts = line.trim().split(" ");
      return {
        move: parts.slice(1).join(" "),
        level: parts[0] as any,
      } as LevelUpMove;
    }),
  eggMoveLogs:
    `Bestow, Bide, Charge, Disarming Voice, Double Slap, Electric Terrain, Encore, Endure, Fake Out, Flail, Lucky Chant, Present, Reversal, Thunder Punch, Tickle, Volt Tackle, Wish`
      .split(", ")
      .map(
        (moveName, i) =>
          ({
            id: i,
            move: moveName,
          } as any)
      ),
  tutorMoveLogs:
    `Body Slam, Counter, Covet, Defense Curl, Double-Edge, Dynamic Punch, Electroweb, Endure, Floaty Fall, Focus Punch, Headbutt, Helping Hand, Iron Tail, Knock Off, Laser Focus, Magnet Rise, Mega Kick, Mega Punch, Mimic, Mud-Slap, Pika Papow, Rising Voltage, Rollout, Seismic Toss, Shock Wave, Signal Beam, Sleep Talk, Snore, Splishy Splash, Substitute, Swagger, Swift, Thunder Punch, Thunder Wave, Thunderbolt, Uproar, Volt Tackle, Zippy Zap, Fake Out`
      .split(", ")
      .map(
        (moveName, i) =>
          ({
            id: i + 1000,
            move: moveName,
          } as any)
      ),
  machineMoveLogs:
    `Agility, Attract, Bide, Body Slam, Brick Break, Calm Mind, Captivate, Charge Beam, Charm, Confide, Curse, Defense Curl, Detect, Dig, Double Team, Double-Edge, Draining Kiss, Dynamic Punch, Echoed Voice, Electric Terrain, Electro Ball, Electroweb, Encore, Endure, Facade, Flash, Fling, Focus Punch, Frustration, Grass Knot, Headbutt, Helping Hand, Hidden Power, Iron Tail, Light Screen, Mega Kick, Mega Punch, Mimic, Mud-Slap, Nasty Plot, Natural Gift, Pay Day, Play Rough, Protect, Rage, Rain Dance, Reflect, Rest, Return, Reversal, Rock Smash, Rollout, Round, Secret Power, Seismic Toss, Shock Wave, Skull Bash, Sleep Talk, Snore, Strength, Submission, Substitute, Surf, Swagger, Swift, Take Down, Thief, Thunder, Thunder Punch, Thunder Wave, Thunderbolt, Toxic, Uproar, Volt Switch, Wild Charge, Zap Cannon, Counter`
      .split(", ")
      .map(
        (moveName, i) =>
          ({
            id: i + 2000,
            move: moveName,
          } as any)
      ),
} as Partial<Pokemon>);

export function PokemonProfileExample() {
  const configRepo = useRepository(BBCodeReplacementConfig);
  const [configs, setConfigs] = useState<BBCodeReplacementConfig[]>([]);
  const autoSaveCounter = useAutoSaveCounter();

  useAsyncEffect(
    async (isActive) => {
      if (!configRepo) return;
      await waitForTransactions(configRepo);
      if (!isActive) return;
      setConfigs(await configRepo.findBy({ specifier: Like("Pokemon%") }));
    },
    [configRepo, autoSaveCounter]
  );

  const applyBBCode = usePokemonBBCodeTemplate(configs);
  const bbCode = useMemo(() => applyBBCode(examplePokemon), [applyBBCode]);
  return <BBCodeArea bbCode={bbCode} label={"Example Pokemon Profile"} />;
}
