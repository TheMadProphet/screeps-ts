import Body from "../body";
import {WORKER} from "../../constants";
import {workerTasks} from "../../creep/workerOrganizer";

const ENERGY_PER_SOURCE = 10;
const ENERGY_EFFICIENCY = 0.8;
const REMOTE_ENERGY_EFFICIENCY = 0.6;

const workerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const upgraders = spawner.room.workersByTask[workerTasks.UPGRADE];
        const builders = spawner.room.workersByTask[workerTasks.BUILD];

        const upgraderWorkPartCount = (upgraders[0]?.getActiveBodyparts(WORK) ?? 0) * upgraders.length;
        const builderWorkPartCount = (builders[0]?.getActiveBodyparts(WORK) ?? 0) * builders.length;

        const upgraderEnergyPerTick = upgraderWorkPartCount;
        const builderEnergyPerTick = builderWorkPartCount * 5;

        let sourceCount = _.size(spawner.room.memory.sources);
        let availableEnergyPerTick = sourceCount * ENERGY_PER_SOURCE * ENERGY_EFFICIENCY;
        if (spawner.room.memory.colonies) {
            const remoteSourceCount = _.sum(
                spawner.room.getAllColonies(),
                colony => Memory.rooms[colony].sources.length
            );

            availableEnergyPerTick += remoteSourceCount * ENERGY_PER_SOURCE * REMOTE_ENERGY_EFFICIENCY;
        }

        if (
            availableEnergyPerTick > upgraderEnergyPerTick + builderEnergyPerTick ||
            spawner.room.creepsByRole[WORKER].length < 4
        ) {
            const template = spawner.room.controller!.level > 4 ? [WORK, CARRY, MOVE] : [WORK, CARRY, MOVE, MOVE];
            spawner.spawn({
                body: new Body(spawner).addParts(template, 10),
                memory: {role: WORKER, task: workerTasks.BUILD}
            });
        }
    }
};

export default workerSpawner;
