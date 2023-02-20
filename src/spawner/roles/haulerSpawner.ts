import Body from "../body";
import {HAULER, MINER} from "../../constants";

const haulerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.creepsByRole[MINER].length === 0) return false;

        // todo
        let sources: Sources = spawner.room.memory.sources;
        if (spawner.room.memory.remoteSources) {
            const remoteSources = Object.values(spawner.room.memory.remoteSources).reduce((acc, sources) => {
                return {
                    ...acc,
                    ...Object.values(sources).reduce((acc2, sourceMemory) => {
                        return {...acc2, [sourceMemory.id]: sourceMemory};
                    }, {})
                };
            }, {} as Sources);
            sources = {...sources, ...remoteSources};
        }

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
            const assignedHaulers = spawner.creepsByRole[HAULER].filter(
                hauler => hauler.memory.assignedSource === sourceId
            );
            const totalWorkParts = source.assignedMiners.reduce(
                (acc, miner) => acc + Game.getObjectById(miner)!.getActiveBodyparts(WORK),
                0
            );

            const body = new Body(spawner).addParts([CARRY, MOVE], 10);
            const energyGeneratedByWorkerPerLifetime = totalWorkParts * 2 * CREEP_LIFE_TIME;
            const biRoutePerLifetime = CREEP_LIFE_TIME / source.pathFromSpawn.length / 2;
            const energyStoredByHaulerPerLifetime = body.getCapacity() * biRoutePerLifetime;
            const requiredHaulerCount = energyGeneratedByWorkerPerLifetime / energyStoredByHaulerPerLifetime;

            if (assignedHaulers.length < requiredHaulerCount) {
                spawner.spawn({
                    parts: body.getParts(),
                    memory: {role: HAULER, assignedSource: sourceId as Id<Source>, assignedRoom: source.roomName}
                });

                return true;
            }
        }

        return false;
    }
};

export default haulerSpawner;
