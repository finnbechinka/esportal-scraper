"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Match_1 = __importDefault(require("./schemas/Match"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const PORT = 3000;
const map_translation = JSON.parse(fs_1.default.readFileSync("./src/misc/maps.json").toString());
mongoose_1.default.set("strictQuery", true);
if (!process.env.MONGODB_CONNECTION_STRING) {
    throw new Error("MONGODB_CONNECTION_STRING env var is undefined");
}
mongoose_1.default.connect(process.env.MONGODB_CONNECTION_STRING);
function log(message) {
    console.log("[" + new Date().toISOString() + "] " + message);
}
function get_live_matches() {
    return __awaiter(this, void 0, void 0, function* () {
        // const timestamp = Math.floor(new Date().getTime() / 1000);
        // log(timestamp);
        let res = yield fetch(`https://esportal.com/api/live_games/list?region_id=0`, {
            method: "GET",
            mode: "cors",
        });
        let body = yield res.json();
        return body;
    });
}
function store_new_matches() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const live_matches = yield get_live_matches();
        for (const live_match of live_matches) {
            if (!live_match.map_id ||
                live_match.gather_id ||
                ((_a = map_translation[live_match.map_id]) === null || _a === void 0 ? void 0 : _a.flags) != 7 ||
                (yield Match_1.default.exists({ id: live_match.id }))) {
                continue;
            }
            const match = yield Match_1.default.create(Object.assign({}, live_match));
        }
        const all_matches = yield Match_1.default.find({});
        log("INFO: current match count: " + all_matches.length);
    });
}
store_new_matches();
setInterval(store_new_matches, 5 * 1000 * 60);
const app = (0, express_1.default)();
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // res.sendFile(path.join(__dirname, "/pages/index.html"));
    const all_matches = yield Match_1.default.find({});
    res.json(all_matches);
}));
app.get("/summary", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let maps = {};
    let total = 0;
    const matches = yield Match_1.default.find({});
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
}));
app.listen(PORT);
log("INFO: listening on port " + PORT);
