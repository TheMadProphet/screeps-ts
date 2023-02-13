import Body from "../body";
import {HAULER, MINER} from "../../constants";

const DISTANCE_TEMP = 15;

const haulerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const totalWorkParts = spawner.creepsByRole[MINER].reduce(
            (acc, miner) => acc + miner.getActiveBodyparts(WORK),
            0
        );

        const body = new Body(spawner).addParts([CARRY, MOVE], 10);
        const energyGeneratedByWorkerPerLifetime = totalWorkParts * 2 * CREEP_LIFE_TIME;
        const biRoutePerLifetime = CREEP_LIFE_TIME / DISTANCE_TEMP / 2;
        const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
        const requiredHaulerCount = energyGeneratedByWorkerPerLifetime / energyStoredByHaulerPerLifetime;

        if (spawner.creepsByRole[HAULER].length < requiredHaulerCount) {
            spawner.spawn({
                parts: body.getParts(),
                memory: {role: HAULER}
            });

            return true;
        }

        return false;
    }
};

export default haulerSpawner;
