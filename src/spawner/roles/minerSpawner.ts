import Body from "../body";
import {MINER} from "../../constants";

const minerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
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
            const sourceMemory = sources[sourceId as Id<Source>] as Required<SourceMemory>;

            let workParts = 0;
            _.forEach(spawner.creepsByRole[MINER], worker => {
                if (worker.memory.assignedSource === sourceId) {
                    workParts += worker.getActiveBodyparts(WORK);
                }
            });

            const hasSpaceForMore = sourceMemory.spaceAvailable > sourceMemory.assignedMiners.length;
            if (hasSpaceForMore && workParts < 6) {
                const body = new Body(spawner).addParts([WORK, WORK, MOVE], 3);

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
