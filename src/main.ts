import "utils/traveler/traveler";
import "utils/sourceMemory";
import "utils/getOffExit";
import "utils/excuseMe";
import "creep/creep";
import "spawner/spawner";
import "room/room";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/console";
import {clearNudges} from "./utils/excuseMe";
import {Statistics} from "./stats/statistics";
import "stats/intentMonitor";
import "stats/pathfindingMonitor";

/**
 * TODO:
 * do nothing for few ticks to build up bucket
 * container for sources and ROADS
 * intent detection for simultaneous actions
 * limit hauler formula based on source energy capacity as well
 * generate pixels
 */
export const loop = ErrorMapper.wrapLoop(() => {
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
});
