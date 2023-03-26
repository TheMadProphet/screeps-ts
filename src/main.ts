import "utils/traveler/traveler";
import "utils/sourceMemory";
import "utils/getOffExit";
import "utils/excuseMe";
import "creep/creep";
import "spawner/spawner";
import "room/tower";
import "room/room";
import {IntentTracker} from "./stats/creepIntentTracker";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/console";
import {clearNudges} from "./utils/excuseMe";
import {Statistics} from "./stats/statistics";
import "stats/pathfindingMonitor";

/**
 * TODO:
 */
export const loop = ErrorMapper.wrapLoop(() => {
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
