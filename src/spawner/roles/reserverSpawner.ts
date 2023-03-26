import Body from "../body";
import {HAULER, MINER, RESERVER} from "../../constants";
import roomReserver from "../../creep/roomReserver";

const reserverSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const roomToReserve = roomReserver.getUnreservedRoomAround(spawner.room);
        const creepsByRole = spawner.room.creepsByRole;

        if (roomToReserve && creepsByRole[MINER].length > 2 && creepsByRole[HAULER].length > 2) {
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
