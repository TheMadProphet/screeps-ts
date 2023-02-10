import Body from "../body";

const harvesterSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const sources = {...spawner.room.memory.sources};

        _.forEach(sources, source => {
            source.assignedWorkers = [];
        });

        _.forEach(spawner.creepsByRole["harvester"], harvester => {
            const assignedSource = harvester.memory.assignedSource;

            if (assignedSource && sources[assignedSource]) {
                sources[assignedSource].assignedWorkers.push(harvester.id);
            }
        });

        for (let sourceId in sources) {
            const sourceMemory = sources[sourceId as Id<Source>];
            if (sourceMemory.assignedWorkers.length < sourceMemory.maxWorkerCount) {
                const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 6);
                return spawner.spawn(body, {role: "harvester", assignedSource: sourceId as Id<Source>});
            }
        }

        return OK;
    }
};

export default harvesterSpawner;
