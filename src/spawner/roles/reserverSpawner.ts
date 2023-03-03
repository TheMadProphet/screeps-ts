import Body from "../body";
import {RESERVER} from "../../constants";
import roomReserver from "../../creep/roomReserver";

const reserverSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const roomToReserve = roomReserver.getUnreservedRoomAround(spawner.room);
        if (roomToReserve) {
            const body = new Body(spawner).addParts([CLAIM, MOVE]);
            spawner.spawn({
                parts: body.getParts(),
                memory: {
                    role: RESERVER,
                    assignedRoom: roomToReserve
                }
            });
        }
    }
};

export default reserverSpawner;
