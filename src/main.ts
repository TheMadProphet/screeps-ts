import "utils/traveler/traveler";
import "utils/getOffExit";
import "utils/excuseMe";
import "creep/creep";
import "spawner/spawner";
import "room/room";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/console";
import {clearNudges} from "./utils/excuseMe";

/**
 * TODO:
 * better source memory access
 * hauler waiting line in source
 * limit hauler formula based on source energy capacity as well
 * emergency spawns
 *
 * handyman redesign (worker)
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
});
