import Body from "../body";
import {WORKER} from "../../constants";
import {workerTasks} from "../../creep/workerOrganizer";

const SOURCE_ENERGY_PER_TICK = 10;
const ENERGY_FOR_CREEPS_PERCENTAGE = 0.35;
const AVAILABLE_SOURCE_ENERGY_PER_TICK = SOURCE_ENERGY_PER_TICK * (1 - ENERGY_FOR_CREEPS_PERCENTAGE);
const BUILDER_EFFICIENCY = 0.75; // E.g. a builder builds 75% of the time, rest is gathering/idle

const workerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const upgraders = spawner.room.workersByTask[workerTasks.UPGRADE];
        const builders = spawner.room.workersByTask[workerTasks.BUILD];

        const upgraderWorkPartCount = (upgraders[0]?.getActiveBodyparts(WORK) ?? 0) * upgraders.length;
        const builderWorkPartCount = (builders[0]?.getActiveBodyparts(WORK) ?? 0) * builders.length;

        const upgraderEnergyPerTick = upgraderWorkPartCount;
        const builderEnergyPerTick = builderWorkPartCount * 5 * BUILDER_EFFICIENCY;

        let sourceCount = _.size(spawner.room.memory.sources);
        let availableEnergyPerTick = sourceCount * AVAILABLE_SOURCE_ENERGY_PER_TICK;
        if (spawner.room.memory.colonies) {
            const remoteSourceCount = _.sum(
                spawner.room.getAllColonies(),
                colony => Memory.rooms[colony].sources.length
            );

            availableEnergyPerTick += remoteSourceCount * AVAILABLE_SOURCE_ENERGY_PER_TICK;
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
