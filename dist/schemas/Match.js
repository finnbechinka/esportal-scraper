"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const match_schema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model("Match", match_schema);
