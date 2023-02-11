import "spawner/spawner";
import "creep/creep";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/Console";

declare global {
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

export const loop = ErrorMapper.wrapLoop(() => {
    improveLog();

    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    _.forEach(Game.rooms, room => room.automate());
    _.forEach(Game.creeps, creep => creep.runRole());
});
