import Match, { IMatch } from "./schemas/Match";
import db, { MongooseError } from "mongoose";
import express, { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";

const PORT = 3000;

type LiveMatchesResponse = {
  id: number;
  country_id: number;
  region_id: number;
  subregion_id: number;
  elo: number;
  map_id: number;
  inserted: number;
  slots_open: number;
  twitch_viewers: any;
  players: number[];
  completed: boolean;
  team1_score: number;
  team2_score: number;
  team1_jump_in_elo: any;
  team2_jump_in_elo: any;
  team1_jump_in_min_rank: any;
  team1_jump_in_max_rank: any;
  team2_jump_in_min_rank: any;
  team2_jump_in_max_rank: any;
  flags: number;
  gather_flags: any;
  gather_id: any;
  gather_name: any;
  tournament_id: any;
  tournament_slug: any;
};

type MapInfo = {
  id: number;
  name: string;
  image: string | null;
  game_id: number;
  flags: number;
  csgo: { category: number | null };
};

type MapMetric = {
  name: string;
  count: number;
  ratio: string;
};

const map_translation: MapInfo[] = JSON.parse(fs.readFileSync("./src/misc/maps.json").toString());

db.set("strictQuery", true);
if (!process.env.MONGODB_CONNECTION_STRING) {
  throw new Error("MONGODB_CONNECTION_STRING env var is undefined");
}
db.connect(process.env.MONGODB_CONNECTION_STRING);

function log(message: string) {
  console.log("[" + new Date().toISOString() + "] " + message);
}

async function get_live_matches(): Promise<LiveMatchesResponse[]> {
  // const timestamp = Math.floor(new Date().getTime() / 1000);
  // log(timestamp);
  let res = await fetch(`https://esportal.com/api/live_games/list?region_id=0`, {
    method: "GET",
    mode: "cors",
  });
  let body: LiveMatchesResponse[] = await res.json();
  return body;
}

async function store_new_matches() {
  const live_matches = await get_live_matches();
  for (const live_match of live_matches) {
    if (
      !live_match.map_id ||
      live_match.gather_id ||
      map_translation[live_match.map_id]?.flags != 7 ||
      (await Match.exists({ id: live_match.id }))
    ) {
      continue;
    }
    const match = await Match.create({
      ...live_match,
    });
  }
  const all_matches = await Match.find({});
  log("INFO: current match count: " + all_matches.length);
}

store_new_matches();
setInterval(store_new_matches, 5 * 1000 * 60);

const app = express();

app.get("/", async (req, res) => {
  // res.sendFile(path.join(__dirname, "/pages/index.html"));
  const all_matches = await Match.find({});
  res.json(all_matches);
});

app.get("/summary", async (req, res) => {
  let maps: { [name: string]: MapMetric } = {};
  let total = 0;
  const matches = await Match.find({});
  for (const match of matches) {
    const map_name = map_translation[match.map_id].name;
    if (!maps[map_name]) {
      maps[map_name] = { name: map_name, count: 0, ratio: "" };
    }
    maps[map_name].count++;
    total++;
  }
  for (const map of Object.values(maps)) {
    map.ratio = ((map.count / total) * 100).toFixed(2) + "%";
  }
  let most_played = Array.from(Object.values(maps))
    .sort((a, b) => {
      return a.ratio < b.ratio ? 1 : -1;
    })
    .slice(0, 10);
  res.send(most_played);
});

app.listen(PORT);
log("INFO: listening on port " + PORT);
