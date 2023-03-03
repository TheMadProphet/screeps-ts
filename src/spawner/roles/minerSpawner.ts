import Body from "../body";
import {MINER} from "../../constants";

class MinerSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const source = this.findSourceWithMissingMiner(spawner.room.memory.sources, spawner);
        if (source) {
            spawner.spawn({
                parts: new Body(spawner).addParts([WORK, WORK, MOVE], 3).getParts(),
                memory: {role: MINER, assignedSource: source.id as Id<Source>}
            });

            return;
        }

        for (const colony of spawner.room.getColonies()) {
            const source = this.findSourceWithMissingMiner(colony.memory.sources, spawner);
            if (source) {
                let body = new Body(spawner).addParts([WORK, WORK, MOVE], 3);
                if (!colony.isBeingReserved()) {
                    body = new Body(spawner).addParts([WORK, WORK, MOVE]).addParts([WORK, MOVE]);
                }

                spawner.spawn({
                    parts: body.getParts(),
                    memory: {role: MINER, assignedSource: source.id as Id<Source>}
                });
            }
        }
    }

    findSourceWithMissingMiner(sourceIds: Id<Source>[], spawner: StructureSpawn): Source | undefined {
        for (const sourceId of sourceIds) {
            const source = Game.getObjectById(sourceId);
            if (!source) continue;

            const assignedMiners = spawner.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === source.id
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const hasSpaceForMore = source.memory.spaceAvailable > assignedMiners.length;
            if (hasSpaceForMore && totalWorkParts < 6) {
                return source;
            }
        }

        return undefined;
    }
}

const minerSpawner = new MinerSpawner();
export default minerSpawner;
