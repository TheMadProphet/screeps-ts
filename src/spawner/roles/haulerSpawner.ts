import Body from "../body";
import {HAULER, MINER} from "../../constants";

const haulerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.creepsByRole[MINER].length === 0) return false;

        // todo
        let sourceIds: Id<Source>[] = spawner.room.memory.sources;
        if (spawner.room.memory.remoteSources) {
            const remoteSourceIds = Object.values(spawner.room.memory.remoteSources).reduce((acc, sources) => {
                return [...acc, ...sources];
            }, [] as Id<Source>[]);
            sourceIds = [...sourceIds, ...remoteSourceIds];
        }

        for (const sourceId of sourceIds) {
            const source = Game.getObjectById(sourceId);
            if (!source) continue;

            const assignedHaulers = spawner.creepsByRole[HAULER].filter(
                hauler => hauler.memory.assignedSource === source.id
            );
            const assignedMiners = spawner.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === source.id
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const body = new Body(spawner).addParts([CARRY, MOVE], 10);
            const energyGeneratedByWorkersPerLifetime = Math.min(totalWorkParts, 5) * 2 * CREEP_LIFE_TIME;
            const biRoutePerLifetime = CREEP_LIFE_TIME / source.memory.distanceToSpawn / 2;
            const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
            const requiredHaulerCount = energyGeneratedByWorkersPerLifetime / energyStoredByHaulerPerLifetime;

            if (assignedHaulers.length < requiredHaulerCount) {
                spawner.spawn({
                    parts: body.getParts(),
                    memory: {role: HAULER, assignedSource: source.id, assignedRoom: source.room.name}
                });

                return true;
            }
        }

        return false;
    }
};

export default haulerSpawner;
