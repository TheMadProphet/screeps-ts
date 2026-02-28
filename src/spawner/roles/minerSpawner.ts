import Body from "../body";
import {MINER} from "../../constants";

class MinerSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const sourceId = this.findSourceWithMissingMiner(spawner.room.memory.sources, spawner);
        if (sourceId) {
            let body = this.getNormalBody(spawner);

            const source = Game.getObjectById(sourceId);
            if (source?.link && source.memory.linkMiningPos) {
                body = this.getLinkBody(spawner);
            }

            spawner.spawn({
                body: body,
                memory: {role: MINER, assignedSource: sourceId, assignedRoom: spawner.room.name}
            });

            return;
        }

        for (const colony of spawner.room.getAllColonies()) {
            if (Memory.rooms[colony].invaderCount ?? 0 > 0) continue;

            const isRoomReserved = Game.rooms[colony]?.isBeingReserved();
            const sourceId = this.findSourceWithMissingMiner(Memory.rooms[colony].sources, spawner, isRoomReserved);
            if (sourceId) {
                spawner.spawn({
                    body: this.getRemoteBody(spawner, colony, sourceId),
                    memory: {role: MINER, assignedSource: sourceId as Id<Source>, assignedRoom: colony}
                });
                return;
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

            if (this.minerWillDieSoon(spawner, assignedMiners)) {
                return sourceId;
            }
        }

        return undefined;
    }

    private minerWillDieSoon(spawner: StructureSpawn, assignedMiners: Creep[]) {
        for (const miner of assignedMiners) {
            if (miner.spawning) continue;

            const ticksToLive = miner.ticksToLive ?? 0;
            const sourceId = miner.memory.assignedSource!;
            let body = this.getNormalBody(spawner);
            if (Memory.sources[sourceId].linkId && Memory.sources[sourceId].linkMiningPos) {
                body = this.getLinkBody(spawner);
            }

            if (ticksToLive < body.getParts().length * CREEP_SPAWN_TIME) {
                return true;
            }
        }

        return false;
    }

    private getNormalBody(spawner: StructureSpawn) {
        return new Body(spawner).addParts([WORK, WORK, MOVE], 3);
    }

    private getLinkBody(spawner: StructureSpawn) {
        return new Body(spawner).addParts([WORK], 10).addParts([CARRY], 2).addParts([MOVE], 5);
    }

    private getRemoteBody(spawner: StructureSpawn, colony: string, sourceId: Id<Source>) {
        const isRoomReserved = Game.rooms[colony]?.isBeingReserved();
        if (!isRoomReserved && spawner.room.controller!.level < 4)
            return new Body(spawner).addParts([WORK, WORK, MOVE]).addParts([WORK, MOVE]);

        let body = this.getNormalBody(spawner);
        if (Memory.sources[sourceId].containerId) body.addParts([WORK, CARRY, MOVE]);

        return body;
    }
}

const minerSpawner = new MinerSpawner();
export default minerSpawner;
