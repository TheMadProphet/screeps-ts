import Body from "../body";
import {RESERVER} from "../../constants";
import roomReserver from "../../creep/roomReserver";

const reserverSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const roomToReserve = roomReserver.getUnreservedRoomAround(spawner.room);
        if (roomToReserve) {
            spawner.spawn({
                body: new Body(spawner).addParts([CLAIM, MOVE]),
                memory: {
                    role: RESERVER,
                    assignedRoom: roomToReserve
                }
            });
        }
    }
};

export default reserverSpawner;
