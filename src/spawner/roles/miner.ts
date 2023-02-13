import Body from "../body";
import {MINER} from "../../constants";

const minerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const sources = {...spawner.room.memory.sources};

        _.forEach(sources, source => {
            source.assignedWorkers = [];
        });

        _.forEach(spawner.creepsByRole[MINER] ?? [], miner => {
            const assignedSource = miner.memory.assignedSource;

            if (assignedSource && sources[assignedSource]) {
                sources[assignedSource].assignedWorkers.push(miner.id);
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

            const hasSpaceForMore = sourceMemory.spaceAvailable > sourceMemory.assignedWorkers.length;
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
