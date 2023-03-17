import Body from "../body";
import {WORKER} from "../../constants";
import {workerTasks} from "../../creep/workerOrganizer";

const ENERGY_PER_SOURCE = 10;
const ENERGY_EFFICIENCY = 0.8;
const REMOTE_ENERGY_EFFICIENCY = 0.6;

const workerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const upgraders = spawner.workersByTask[workerTasks.UPGRADE];
        const builders = spawner.workersByTask[workerTasks.BUILD];

        const upgraderWorkPartCount = (upgraders[0]?.getActiveBodyparts(WORK) ?? 0) * upgraders.length;
        const builderWorkPartCount = (builders[0]?.getActiveBodyparts(WORK) ?? 0) * builders.length;

        const upgraderEnergyPerTick = upgraderWorkPartCount;
        const builderEnergyPerTick = builderWorkPartCount * 5;

        let sourceCount = _.size(spawner.room.memory.sources);
        let availableEnergyPerTick = sourceCount * ENERGY_PER_SOURCE * ENERGY_EFFICIENCY;
        if (spawner.room.memory.colonies) {
            const remoteSourceCount = _.sum(spawner.room.getColonies(), colony => colony.memory.sources.length);

            availableEnergyPerTick += remoteSourceCount * ENERGY_PER_SOURCE * REMOTE_ENERGY_EFFICIENCY;
        }

        if (availableEnergyPerTick > upgraderEnergyPerTick + builderEnergyPerTick) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 5),
                memory: {role: WORKER, task: workerTasks.BUILD}
            });
        }
    }
};

export default workerSpawner;
