import Body from "../body";
import {HAULER, MINER} from "../../constants";

const haulerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.creepsByRole[MINER].length === 0) return false;

        // todo
        const sources = {...spawner.room.memory.sources};

        _.forEach(sources, source => {
            source.assignedMiners = [];
        });

        _.forEach(spawner.creepsByRole[MINER] ?? [], miner => {
            const assignedSource = miner.memory.assignedSource;

            if (assignedSource && sources[assignedSource]) {
                sources[assignedSource].assignedMiners.push(miner.id);
            }
        });

        for (let sourceId in sources) {
            const source = sources[sourceId as Id<Source>];
            const totalWorkParts = source.assignedMiners.reduce(
                (acc, miner) => acc + Game.getObjectById(miner)!.getActiveBodyparts(WORK),
                0
            );

            const body = new Body(spawner).addParts([CARRY, MOVE], 10);
            const energyGeneratedByWorkerPerLifetime = totalWorkParts * 2 * CREEP_LIFE_TIME;
            const biRoutePerLifetime = CREEP_LIFE_TIME / source.pathFromSpawn.length / 2;
            const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
            const requiredHaulerCount = energyGeneratedByWorkerPerLifetime / energyStoredByHaulerPerLifetime;

            if (spawner.creepsByRole[HAULER].length < requiredHaulerCount) {
                spawner.spawn({
                    parts: body.getParts(),
                    memory: {role: HAULER, assignedSource: sourceId as Id<Source>}
                });

                return true;
            }
        }

        return false;
    }
};

export default haulerSpawner;
