import fs from "fs";
import { RacingType } from "../types/Kra";
import { RacingData } from "../kra/KRAClient";

export const Races = (
    JSON.parse(fs.readFileSync("odds.json", "utf-8")) as RacingType[]
).map(
    (h) => new RacingData(h.size, h.odds_1, h.odds_2, h.odds_3, h.two, h.place)
);
