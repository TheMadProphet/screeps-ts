import Body from "../body";
import {WORKER} from "../../constants";
import {workerTasks} from "../../creep/workerOrganizer";

const SOURCE_ENERGY_PER_TICK = SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
const ENERGY_FOR_CREEPS_PERCENTAGE = 0.35;
const AVAILABLE_SOURCE_ENERGY_PER_TICK = SOURCE_ENERGY_PER_TICK * (1 - ENERGY_FOR_CREEPS_PERCENTAGE);
const BUILDER_EFFICIENCY = 0.75; // E.g. a builder builds 75% of the time, rest is gathering/idle
const WORK_PART_ENERGY_PER_TICK = 5; // Each WORK part contributes 5 energy per tick to building
const FORCE_SPAWN_THRESHOLD = 100000; // If storage has more than this amount, spawn builders regardless

const workerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const upgraders = spawner.room.workersByTask[workerTasks.UPGRADE];
        const builders = spawner.room.workersByTask[workerTasks.BUILD];

        const upgraderWorkPartCount = (upgraders[0]?.getActiveBodyparts(WORK) ?? 0) * upgraders.length;
        const builderWorkPartCount = (builders[0]?.getActiveBodyparts(WORK) ?? 0) * builders.length;

        const upgraderEnergyPerTick = upgraderWorkPartCount;
        const builderEnergyPerTick = builderWorkPartCount * WORK_PART_ENERGY_PER_TICK * BUILDER_EFFICIENCY;

        let sourceCount = _.size(spawner.room.memory.sources);
        let availableEnergyPerTick = sourceCount * AVAILABLE_SOURCE_ENERGY_PER_TICK;
        if (spawner.room.memory.colonies) {
            const remoteSourceCount = _.sum(spawner.room.getAllColonies(), it => {
                const colonyMemory = Memory.rooms[it];
                if (!colonyMemory.sources) {
                    return 0;
                }

                const colony = Game.rooms[it];
                if (!colony?.isBeingReserved()) {
                    // Half the capacity if not reserved
                    return colonyMemory.sources.length / 2;
                }

                return colonyMemory.sources.length;
            });

            availableEnergyPerTick += remoteSourceCount * AVAILABLE_SOURCE_ENERGY_PER_TICK;
        }

        if (
            availableEnergyPerTick > upgraderEnergyPerTick + builderEnergyPerTick ||
            (spawner.room.storage?.store?.getUsedCapacity(RESOURCE_ENERGY) ?? 0) > FORCE_SPAWN_THRESHOLD ||
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
