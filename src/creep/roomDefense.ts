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
        return room.creepsByRole[DEFENDER].length < 1 && this.isInvaderInColonies(room);
    }

    private isInvaderInColonies(room: Room) {
        return this.findColoniesWithInvaders(room).length > 0;
    }

    private findColoniesWithInvaders(room: Room) {
        return room.getAllColonies().filter(it => Memory.rooms[it].hadInvaderCreepLastTick);
    }
}

const roomDefense = new RoomDefense();
export default roomDefense;
