import Body from "../body";

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        // if (spawner.room.fillersAreEnabled()) { todo
        const fillers = spawner.creepsByRole["filler"];
        const maxFillers = 1;

        if (!fillers || !fillers.length || fillers.length < maxFillers) {
            const body = new Body(spawner).addParts([CARRY, CARRY, MOVE], 7);
            return spawner.spawn(body, {role: "filler"});
        }

        return OK;
    }
};

export default fillerSpawner;
