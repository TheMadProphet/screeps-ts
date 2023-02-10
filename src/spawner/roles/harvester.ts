const harvesterSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        // const sources = spawner.room.memory.sources;
        //
        // _.forEach(sources, source => {
        //     source.assignedWorkers = [];
        // });
        //
        // _.forEach(spawner.creepsByRole["harvester"], harvester => {
        //     const assignedSource = harvester.memory.assignedSource;
        //
        //     if (assignedSource && sources[assignedSource]) {
        //         sources[assignedSource].assignedWorkers.push(harvester);
        //     }
        // });
        //
        // for (let sourceId in sources) {
        //     const sourceMemory = sources[sourceId];
        //     if (sourceMemory.assignedWorkers.length < sourceMemory.maxWorkerCount) {
        //         const body = new Body(spawner).addParts(basicParts, 6);
        //         return spawner.spawn(body, {role: "harvester", assignedSource: sourceId});
        //     }
        // }
        //
        return OK;
    }
};

export default harvesterSpawner;
