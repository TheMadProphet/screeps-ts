import roomScanner from "../roomScanner";

class ScoutBehavior implements ScoutBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        if (this.isInAssignedRoom(creep)) {
            roomScanner.scanRoom(creep.room, Game.rooms[creep.memory.home]);
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
