const express = require("express");
const path = require("path");
const db = require("mongoose");
const Match = require("./schemas/Match.js");

const PORT = 3000;

db.connect("mongodb://mongo:2717/esportal-scraper");

function log(message) {
  console.log("[" + new Date().toISOString() + "] " + message);
}

async function get_live_matches() {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  log(timestamp);
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
    if (!live_match.map_id || (await Match.exists({ id: live_match.id }))) {
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

app.listen(PORT);
log("INFO: listening on port " + PORT);
