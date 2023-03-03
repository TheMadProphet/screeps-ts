import Body from "../body";
import {HAULER, MINER} from "../../constants";

class HaulerSpawner implements RoleSpawner {
    public spawn(spawner: StructureSpawn) {
        if (spawner.creepsByRole[MINER].length === 0) return;

        const body = new Body(spawner).addParts([CARRY, MOVE], 10);
        const source = this.findSourceWithMissingHauler(spawner, spawner.room.memory.sources, body);
        if (source) {
            spawner.spawn({
                body: body,
                memory: {
                    role: HAULER,
                    assignedSource: source.id,
                    assignedRoom: source.room.name
                }
            });

            return;
        }

        for (const colony of spawner.room.getColonies()) {
            let remoteHaulerBody = body;
            if (spawner.room.controller!.level >= 3) {
                remoteHaulerBody = new Body(spawner).addParts([WORK, MOVE]).addParts([CARRY, MOVE], 10);
            }

            const remoteSource = this.findSourceWithMissingHauler(spawner, colony.memory.sources, remoteHaulerBody);
            if (remoteSource) {
                spawner.spawn({
                    body: remoteHaulerBody,
                    memory: {
                        role: HAULER,
                        assignedSource: remoteSource.id,
                        assignedRoom: remoteSource.room.name
                    }
                });
            }
        }
    }

    private findSourceWithMissingHauler(
        spawner: StructureSpawn,
        sourceIds: Id<Source>[],
        body: Body
    ): Source | undefined {
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

            const energyGeneratedByWorkersPerLifetime = Math.min(totalWorkParts, 5) * 2 * CREEP_LIFE_TIME;
            const biRoutePerLifetime = CREEP_LIFE_TIME / source.memory.pathCost / 2;
            const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
            const requiredHaulerCount = energyGeneratedByWorkersPerLifetime / energyStoredByHaulerPerLifetime;

            if (assignedHaulers.length < requiredHaulerCount) {
                return source;
            }
        }

        return undefined;
    }
}

const haulerSpawner = new HaulerSpawner();
export default haulerSpawner;
