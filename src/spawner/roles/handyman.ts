import Body from "../body";

const handymanSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const handymen = spawner.creepsByRole[HANDYMAN];
        if (spawner.room.controller && spawner.room.controller.level >= 2 && (!handymen || !handymen.length)) {
            const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 3);
            return spawner.spawn(body, {role: HANDYMAN});
        }

        return OK;
    }
};

export default handymanSpawner;
