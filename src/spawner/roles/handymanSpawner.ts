import Body from "../body";
import {HANDYMAN} from "../../constants";

const handymanSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const handymen = spawner.creepsByRole[HANDYMAN];
        if (spawner.room.controller && spawner.room.controller.level >= 3 && (!handymen || !handymen.length)) {
            const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 3);

            spawner.spawn({
                parts: body.getParts(),
                memory: {
                    role: HANDYMAN
                }
            });

            return true;
        }

        return false;
    }
};

export default handymanSpawner;
