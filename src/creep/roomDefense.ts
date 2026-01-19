import {DEFENDER} from "../constants";

declare global {
    interface RoomMemory {}
}

class RoomDefense {
    public getRoomToDefend(creep: Creep): string | undefined {
        const home = Game.rooms[creep.memory.home];

        const roomsWithInvaders = this.findColoniesWithInvaders(home);
        if (roomsWithInvaders.length) {
            return roomsWithInvaders[0];
        }

        return undefined;
    }

    public needsDefenseCreep(room: Room): boolean {
        const invadedColonies = this.findColoniesWithInvaders(room);
        const totalInvaders = _.sum(invadedColonies.map(it => Memory.rooms[it].invaderCount ?? 0));

        return room.creepsByRole[DEFENDER].length < Math.ceil(totalInvaders / 2);
    }

    private findColoniesWithInvaders(room: Room) {
        return room.getAllColonies().filter(it => Memory.rooms[it].invaderCount);
    }
}

const roomDefense = new RoomDefense();
export default roomDefense;
