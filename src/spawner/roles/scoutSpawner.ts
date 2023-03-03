import Body from "../body";
import {SCOUT} from "../../constants";
import roomScanner from "../../creep/roomScanner";

const scoutSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomScanner.needsMoreScouts(spawner.room)) {
            spawner.spawn({
                body: new Body(spawner).addParts([MOVE]),
                memory: {
                    role: SCOUT,
                    assignedRoom: roomScanner.getUnscoutedRoomAround(spawner.room)
                }
            });
        }
    }
};

export default scoutSpawner;
