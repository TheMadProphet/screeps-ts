import {RESERVER} from "../constants";

function willDieSoon(creep: Creep) {
    return !creep.spawning && creep.ticksToLive! < 100;
}

const roomReserver = {
    getUnreservedRoomAround(room: Room): string | null {
        if (!room.memory.remoteSources || room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE])
            return null;

        const reservers = room.spawn.creepsByRole[RESERVER];
        const roomsToReserve = Object.keys(room.memory.remoteSources);

        for (const roomToReserve of roomsToReserve) {
            const roomReservers = reservers.filter(it => it.memory.assignedRoom === roomToReserve);
            if (!roomReservers?.length) {
                return roomToReserve;
            }

            const reserver = roomReservers[0];
            if (willDieSoon(reserver) && roomReservers.length < 2) {
                return roomToReserve;
            }
        }

        return null;
    }
};

export default roomReserver;
