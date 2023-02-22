const db = require("mongoose");

const match_schema = new db.Schema({
  id: { type: Number, required: true },
  map_id: { type: Number, required: true },
  country_id: Number,
  subregion_id: Number,
  elo: Number,
  inserted: Number,
  flags: Number,
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

module.exports = db.model("Match", match_schema);
