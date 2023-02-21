import {RESERVER} from "../constants";

const roomReserver = {
    getUnreservedRoomAround(room: Room): string | null {
        if (!room.memory.remoteSources || room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE])
            return null;

        const reservers = room.spawn.creepsByRole[RESERVER];
        const roomsToReserve = Object.keys(room.memory.remoteSources);

        for (const roomToReserve of roomsToReserve) {
            const reserver = reservers.find(it => it.memory.assignedRoom === roomToReserve);
            if (!reserver) return roomToReserve;
        }

        return null;
    }
};

export default roomReserver;
