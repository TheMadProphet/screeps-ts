import {RESERVER} from "../constants";

const roomReserver = {
    getUnreservedRoomAround(room: Room): string | null {
        if (!room.memory.remoteSources || room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE])
            return null;
        const reservers = room.spawn.creepsByRole[RESERVER];
        const roomsToReserve = this.getRoomsToReserveAround(room);

        for (const roomToReserve of roomsToReserve) {
            const reserver = reservers.find(it => it.memory.assignedRoom === roomToReserve);
            if (!reserver) return roomToReserve;
        }

        return null;
    },

    getRoomsToReserveAround(room: Room) {
        const rooms: string[] = [];
        for (const sources of Object.values(room.memory.remoteSources!)) {
            const sourceMemories = Object.values(sources);
            if (!sourceMemories.length) continue;

            rooms.push(sourceMemories[0].roomName);
        }

        return rooms;
    }
};

export default roomReserver;
