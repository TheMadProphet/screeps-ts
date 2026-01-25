import "utils/traveler/traveler";
import "utils/memory/sourceMemory";
import "utils/getOffExit";
import "utils/excuseMe";
import "utils/roomVisuals";
import "creep/creep";
import "spawner/spawner";
import "room/tower";
import "room/link";
import "room/room";
import {IntentTracker} from "./stats/creepIntentTracker";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/console";
import {clearNudges} from "./utils/excuseMe";
import {Statistics} from "./stats/statistics";
import "stats/pathfindingMonitor";
import "stats/findMonitor";
import {memHack} from "./utils/memory/memHack";

/**
 * TODO:
 * Haulers being greedy with withdraw
 * Extract mineral logic
 * More robust defense logic based on threat (kiting, healing, squads)
 * Source pathcost, recalculate
 * Room spawn abstraction
 * Lab/Factory management
 * Market orders
 */
export const loop = ErrorMapper.wrapLoop(() => {
    memHack.run();

    Statistics.onTickStart();

    IntentTracker.WrapIntents(Creep.prototype);
    improveLog();
    clearNudges();
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    _.forEach(Game.rooms, room => room.automate());
    _.forEach(Game.creeps, creep => creep.runRole());

    Statistics.exportAll();

    if (Game.cpu.bucket === 10000) Game.cpu.generatePixel();
});
