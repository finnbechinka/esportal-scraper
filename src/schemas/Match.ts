import db, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  id: number;
  map_id: number;
  country_id?: number;
  subregion_id?: number;
  elo?: number;
  inserted?: number;
  flags: number;
  created_at: Date;
}

const match_schema: Schema = new db.Schema({
  id: { type: Number, required: true },
  map_id: { type: Number, required: true },
  country_id: Number,
  subregion_id: Number,
  elo: Number,
  inserted: Number,
  flags: { type: Number, required: true },
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

export default db.model<IMatch>("Match", match_schema);
