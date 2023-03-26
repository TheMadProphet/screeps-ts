import Body from "../body";
import {MINER} from "../../constants";

class MinerSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const sourceId = this.findSourceWithMissingMiner(spawner.room.memory.sources, spawner);
        if (sourceId) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, WORK, MOVE], 3),
                memory: {role: MINER, assignedSource: sourceId as Id<Source>, assignedRoom: spawner.room.name}
            });

            return;
        }

        for (const colony of spawner.room.getAllColonies()) {
            const isRoomReserved = !Game.rooms[colony]?.isBeingReserved();
            const sourceId = this.findSourceWithMissingMiner(Memory.rooms[colony].sources, spawner, isRoomReserved);
            if (sourceId) {
                let body = new Body(spawner).addParts([WORK, WORK, MOVE], 3).addParts([CARRY]);
                if (isRoomReserved) {
                    body = new Body(spawner).addParts([WORK, WORK, MOVE]).addParts([WORK, MOVE]).addParts([CARRY]);
                }

                spawner.spawn({
                    body: body,
                    memory: {role: MINER, assignedSource: sourceId as Id<Source>, assignedRoom: colony}
                });
            }
        }
    }

    findSourceWithMissingMiner(
        sourceIds: Id<Source>[],
        spawner: StructureSpawn,
        isRoomReserved = true
    ): Id<Source> | undefined {
        for (const sourceId of sourceIds) {
            const assignedMiners = spawner.room.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === sourceId
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const hasSpaceForMore = Memory.sources[sourceId].spaceAvailable > assignedMiners.length;
            if (hasSpaceForMore) {
                const sourceCapacity = isRoomReserved ? 3000 : 1500;
                if (sourceCapacity >= totalWorkParts * 2 * 300) {
                    return sourceId;
                }
            }
        }

        return undefined;
    }
}

const minerSpawner = new MinerSpawner();
export default minerSpawner;
