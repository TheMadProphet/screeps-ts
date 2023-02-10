import Body from "../body";

const builderSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        // if (spawner.room.constructionSites.length) { todo
        const builders = spawner.creepsByRole["builder"];
        const maxBuilders = 2;
        if (!builders || !builders.length || builders.length < maxBuilders) {
            const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 5);
            return spawner.spawn(body, {role: "builder"});
        }

        return OK;
    }
};

export default builderSpawner;
