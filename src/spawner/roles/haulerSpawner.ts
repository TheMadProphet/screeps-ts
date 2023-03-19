import Body from "../body";
import {HAULER, MINER} from "../../constants";

class HaulerSpawner implements RoleSpawner {
    public spawn(spawner: StructureSpawn) {
        if (spawner.room.creepsByRole[MINER].length === 0) return;

        const body = new Body(spawner).addParts([CARRY, MOVE], 10);
        const sourceId = this.findSourceWithMissingHauler(spawner, spawner.room.memory.sources, body);
        if (sourceId) {
            spawner.spawn({
                body: body,
                memory: {
                    role: HAULER,
                    assignedSource: sourceId,
                    assignedRoom: spawner.room.name
                }
            });

            return;
        }

        for (const colony of spawner.room.getColonies()) {
            let remoteHaulerBody = body;
            if (spawner.room.controller!.level >= 3) {
                remoteHaulerBody = new Body(spawner).addParts([WORK, MOVE]).addParts([CARRY, MOVE], 10);
            }

            const remoteSourceId = this.findSourceWithMissingHauler(
                spawner,
                Memory.rooms[colony].sources,
                remoteHaulerBody
            );

            if (remoteSourceId) {
                spawner.spawn({
                    body: remoteHaulerBody,
                    memory: {
                        role: HAULER,
                        assignedSource: remoteSourceId,
                        assignedRoom: colony
                    }
                });
            }
        }
    }

    private findSourceWithMissingHauler(
        spawner: StructureSpawn,
        sourceIds: Id<Source>[],
        body: Body
    ): Id<Source> | undefined {
        for (const sourceId of sourceIds) {
            const assignedHaulers = spawner.room.creepsByRole[HAULER].filter(
                hauler => hauler.memory.assignedSource === sourceId
            );
            const assignedMiners = spawner.room.creepsByRole[MINER].filter(
                miner => miner.memory.assignedSource === sourceId
            );
            const totalWorkParts = _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));

            const energyGeneratedByWorkersPerLifetime = Math.min(totalWorkParts, 5) * 2 * CREEP_LIFE_TIME;
            const pathCost = Memory.sources[sourceId].pathCost / 2; // TODO: dont need to divide if using ignoreRoads option
            const biRoutePerLifetime = CREEP_LIFE_TIME / pathCost / 2;
            const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
            const requiredHaulerCount = energyGeneratedByWorkersPerLifetime / energyStoredByHaulerPerLifetime;

            if (assignedHaulers.length < requiredHaulerCount) {
                return sourceId;
            }
        }

        return undefined;
    }
}

const haulerSpawner = new HaulerSpawner();
export default haulerSpawner;
