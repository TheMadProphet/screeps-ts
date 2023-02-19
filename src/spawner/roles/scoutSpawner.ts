import Body from "../body";
import {SCOUT} from "../../constants";
import roomScanner from "../../creep/roomScanner";

const scoutSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomScanner.needsMoreScouts(spawner.room)) {
            const body = new Body(spawner).addParts([MOVE]);
            spawner.spawn({
                parts: body.getParts(),
                memory: {
                    role: SCOUT,
                    assignedRoom: roomScanner.getUnscoutedRoomAround(spawner.room)
                }
            });

            return true;
        }

        return false;
    }
};

export default scoutSpawner;
