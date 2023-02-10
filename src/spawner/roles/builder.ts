import Body from "../body";

const builderSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        // if (spawner.room.constructionSites.length) {
        const builders = spawner.creepsByRole["builder"];
        const maxBuilders = 2;
        if (!builders || !builders.length || builders.length < maxBuilders) {
            console.log("if");
            const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 5);
            // const body = new Body(spawner).addParts(basicParts, 5);
            return spawner.spawn(body, {role: "builder"});
        }

        return OK;
    }
};

export default builderSpawner;
