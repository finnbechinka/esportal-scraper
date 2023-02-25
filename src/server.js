const express = require("express");
const path = require("path");
const db = require("mongoose");
const Match = require("./schemas/Match.js");
const fs = require("fs");
const map_translation = JSON.parse(fs.readFileSync("./src/misc/maps.json"));

const PORT = 3000;

db.connect(process.env.MONGODB_CONNECTION_STRING);

function log(message) {
  console.log("[" + new Date().toISOString() + "] " + message);
}

async function get_live_matches() {
  // const timestamp = Math.floor(new Date().getTime() / 1000);
  // log(timestamp);
  res = await fetch(`https://esportal.com/api/live_games/list?region_id=0`, {
    method: "GET",
    mode: "cors",
  });
  body = await res.json();
  return body;
}

async function store_new_matches() {
  const live_matches = await get_live_matches();
  for (const live_match of live_matches) {
    if (!live_match.map_id || live_match.gather_id || (await Match.exists({ id: live_match.id }))) {
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
  let maps = {};
  let total = 0;
  const matches = await Match.find({});
  for (const match of matches) {
    const map_name = map_translation[match.map_id].name;
    if (!maps[map_name]) {
      maps[map_name] = { name: map_name, count: 0, ratio: undefined };
    }
    maps[map_name].count++;
    total++;
  }
  for (const map of Object.values(maps)) {
    map.ratio = ((map.count / total) * 100).toFixed(2) + "%";
  }
  let most_played = Array.from(Object.values(maps))
    .sort((a, b) => {
      a.ratio < b.ratio ? 1 : -1;
    })
    .slice(0, 10);
  res.send(most_played);
});

app.listen(PORT);
log("INFO: listening on port " + PORT);
