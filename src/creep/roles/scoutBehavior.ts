import roomScanner from "../roomScanner";

class ScoutBehavior implements ScoutBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            const roomToScout = roomScanner.getUnscoutedNeighborFor(Game.rooms[creep.memory.home]);

            if (!roomToScout) {
                creep.suicide();
            } else {
                creep.memory.assignedRoom = roomToScout;
            }
        }

        if (this.isInAssignedRoom(creep)) {
            roomScanner.scanRoom(creep.room, Game.rooms[creep.memory.home]);
            creep.memory.assignedRoom = null;
            creep.getOffExit();
        } else {
            creep.moveToAssignedRoom();
        }
    }

    private isInAssignedRoom(creep: Creep) {
        return creep.memory.assignedRoom === creep.room.name;
    }
}

const scoutBehavior = new ScoutBehavior();
export default scoutBehavior;
