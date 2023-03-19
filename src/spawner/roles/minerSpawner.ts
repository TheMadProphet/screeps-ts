import Body from "../body";
import {MINER} from "../../constants";

class MinerSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const source = this.findSourceWithMissingMiner(spawner.room.memory.sources, spawner);
        if (source) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, WORK, MOVE], 3),
                memory: {role: MINER, assignedSource: source.id as Id<Source>, assignedRoom: source.room.name}
            });

            return;
        }

        for (const colony of spawner.room.getColonies()) {
            const source = this.findSourceWithMissingMiner(Memory.rooms[colony].sources, spawner);
            if (source) {
                let body = new Body(spawner).addParts([WORK, WORK, MOVE], 3);
                if (!Game.rooms[colony]?.isBeingReserved()) {
                    body = new Body(spawner).addParts([WORK, WORK, MOVE]).addParts([WORK, MOVE]);
                }

                spawner.spawn({
                    body: body,
                    memory: {role: MINER, assignedSource: source.id as Id<Source>, assignedRoom: source.room.name}
                });
            }
        }
    }

    findSourceWithMissingMiner(sourceIds: Id<Source>[], spawner: StructureSpawn): Source | undefined {
        for (const sourceId of sourceIds) {
            const source = Game.getObjectById(sourceId);
            if (!source) continue;

            const assignedMiners = spawner.room.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === source.id
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const hasSpaceForMore = source.memory.spaceAvailable > assignedMiners.length;
            if (hasSpaceForMore) {
                if (source.energyCapacity >= totalWorkParts * 2 * 300) {
                    return source;
                }
            }
        }

        return undefined;
    }
}

const minerSpawner = new MinerSpawner();
export default minerSpawner;
