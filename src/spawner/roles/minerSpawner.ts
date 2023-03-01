import Body from "../body";
import {MINER} from "../../constants";

const minerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
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

            const assignedMiners = spawner.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === source.id
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const hasSpaceForMore = source.memory.spaceAvailable > assignedMiners.length;
            if (hasSpaceForMore && totalWorkParts < 6) {
                let body = new Body(spawner).addParts([WORK, WORK, MOVE], 3);

                if (source.room.name !== spawner.room.name) {
                    if (spawner.room.energyCapacityAvailable < 650) {
                        if (totalWorkParts >= 3) continue;
                        body = new Body(spawner).addParts([WORK, WORK, MOVE]).addParts([WORK, MOVE]);
                    }
                }

                spawner.spawn({
                    parts: body.getParts(),
                    memory: {role: MINER, assignedSource: sourceId as Id<Source>}
                });

                return true;
            }
        }

        return false;
    }
};

export default minerSpawner;
