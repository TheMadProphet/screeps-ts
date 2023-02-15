import "creep/creep";
import "spawner/spawner";
import "room/room";
import {ErrorMapper} from "utils/ErrorMapper";
import {improveLog} from "utils/Console";
import workerOrganizer from "./creep/workerOrganizer";

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

    _.forEach(Game.rooms, room => {
        room.automate();
        workerOrganizer.organizeWorkersIn(room);
    });

    _.forEach(Game.creeps, creep => creep.runRole());
});
