import Body from "../body";
import {SCOUT} from "../../constants";
import roomExplorer from "../../creep/roomExplorer";

const scoutSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomExplorer.needsScout(spawner.room)) {
            const body = new Body(spawner).addParts([MOVE]);
            spawner.spawn({
                parts: body.getParts(),
                memory: {
                    role: SCOUT
                }
            });

            return true;
        }

        return false;
    }
};

export default scoutSpawner;
