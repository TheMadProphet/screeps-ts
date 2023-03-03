import {RESERVER} from "../constants";

function willDieSoon(creep: Creep) {
    return !creep.spawning && creep.ticksToLive! < 100;
}

const roomReserver = {
    getUnreservedRoomAround(room: Room): string | null {
        if (!room.memory.colonies || room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE])
            return null;

        const reservers = room.spawn.creepsByRole[RESERVER];

        for (const colony of room.memory.colonies) {
            const roomReservers = reservers.filter(it => it.memory.assignedRoom === colony);
            if (!roomReservers?.length) {
                return colony;
            }

            const reserver = roomReservers[0];
            if (willDieSoon(reserver) && roomReservers.length < 2) {
                return colony;
            }
        }

        return null;
    }
};

export default roomReserver;
