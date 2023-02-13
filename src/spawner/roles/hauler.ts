import Body from "../body";
import {HARVESTER, HAULER, MINER} from "../../constants";

const haulerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        let distanceToSpawns = 0;
        _.forEach(spawner.room.memory.sources, source => {
            distanceToSpawns += (source as SourceMemory).distanceToSpawn ?? 0;
        })

        const totalWorkParts = spawner.creepsByRole[MINER].reduce(
            (acc, miner) => acc + miner.getActiveBodyparts(WORK),
            0
        );

        const body = new Body(spawner).addParts([CARRY, MOVE], 10);
        const energyGeneratedByWorkerPerLifetime = totalWorkParts * 2 * CREEP_LIFE_TIME;
        const biRoutePerLifetime = CREEP_LIFE_TIME / distanceToSpawns / 2;
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
