import Body from "../body";
import {UPGRADER} from "../../constants";

function extraCreepCountForDistance(start: RoomPosition, end: RoomPosition) {
    const distance = start.findPathTo(end).length;

    return Math.trunc(distance / 15);
}

const upgraderSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const controller = spawner.room.controller;
        if (!controller) return;

        const upgraders = spawner.creepsByRole[UPGRADER];
        let maxUpgraders = 3 + extraCreepCountForDistance(spawner.pos, controller.pos);
        if (
            controller.level === 1 ||
            spawner.room.availableExtension > 0 ||
            spawner.room.constructionSites.length > 0
        ) {
            maxUpgraders = 1;
        } else if (controller.level === 2) {
            maxUpgraders = 3;
        }

        if (!upgraders || !upgraders.length || upgraders.length < maxUpgraders) {
            const body = new Body(spawner)
                .addParts([WORK, WORK, WORK, CARRY, MOVE, MOVE], 2)
                .addParts([WORK, CARRY, MOVE], 2);

            spawner.addQueue({
                parts: body.getParts(),
                memory: {role: UPGRADER}
            });
        }
    }
};

export default upgraderSpawner;
