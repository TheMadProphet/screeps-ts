import Body from "../body";
import {SCOUT} from "../../constants";
import roomScanner from "../../creep/roomScanner";

const scoutSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomScanner.needsMoreScouts(spawner.room)) {
            spawner.spawn({
                parts: new Body(spawner).addParts([MOVE]).getParts(),
                memory: {
                    role: SCOUT,
                    assignedRoom: roomScanner.getUnscoutedRoomAround(spawner.room)
                }
            });
        }
    }
};

export default scoutSpawner;
