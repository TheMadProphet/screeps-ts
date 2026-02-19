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

    public shouldActivateSafeMode(room: Room): boolean {
        if (!room.controller) return false;
        if (room.controller.safeModeAvailable === 0) return false;
        if ((room.controller.safeModeCooldown || 0) > 0) return false;

        const enemyCreeps = room.find(FIND_HOSTILE_CREEPS);
        for (const creep of enemyCreeps) {
            const structuresInRange = creep.pos
                .findInRange(FIND_MY_STRUCTURES, 3)
                .filter(it => it.structureType !== STRUCTURE_EXTRACTOR && it.structureType !== STRUCTURE_RAMPART);

            if (structuresInRange.length > 0) {
                return true;
            }
        }

        return false;
    }

    private findColoniesWithInvaders(room: Room) {
        return room.getAllColonies().filter(it => Memory.rooms[it].invaderCount);
    }
}

const roomDefense = new RoomDefense();
export default roomDefense;
