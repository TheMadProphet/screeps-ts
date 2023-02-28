import Body from "../body";
import {WORKER} from "../../constants";
import {WorkerTask} from "../../creep/workerOrganizer";

const ENERGY_PER_SOURCE = 10;
const ENERGY_EFFICIENCY = 0.8;
const REMOTE_ENERGY_EFFICIENCY = 0.6;

const workerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const upgraders = spawner.workersByTask[WorkerTask.UPGRADE];
        const builders = spawner.workersByTask[WorkerTask.BUILD];

        const upgraderWorkPartCount = (upgraders[0]?.getActiveBodyparts(WORK) ?? 0) * upgraders.length;
        const builderWorkPartCount = (builders[0]?.getActiveBodyparts(WORK) ?? 0) * builders.length;

        const upgraderEnergyPerTick = upgraderWorkPartCount;
        const builderEnergyPerTick = builderWorkPartCount * 5;

        let sourceCount = _.size(spawner.room.memory.sources);
        let availableEnergyPerTick = sourceCount * ENERGY_PER_SOURCE * ENERGY_EFFICIENCY;
        if (spawner.room.memory.remoteSources) {
            const remoteSourceCount = _.sum(Object.values(spawner.room.memory.remoteSources), sources =>
                _.size(sources)
            );
            availableEnergyPerTick += remoteSourceCount * ENERGY_PER_SOURCE * REMOTE_ENERGY_EFFICIENCY;
        }

        if (availableEnergyPerTick > upgraderEnergyPerTick + builderEnergyPerTick) {
            const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 5);

            spawner.spawn({
                parts: body.getParts(),
                memory: {role: WORKER, task: WorkerTask.BUILD}
            });

            return true;
        }

        return false;
    }
};

export default workerSpawner;
