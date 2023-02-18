import roomExplorer from "../roomExplorer";

class ScoutBehavior implements ScoutBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        if (this.isInAssignedRoom(creep)) {
            roomExplorer.scan(creep.room, Game.rooms[creep.memory.home]);
            creep.memory.assignedRoom = null;
        } else {
            this.moveToAssignedRoom(creep);
        }
    }

    private moveToAssignedRoom(creep: Creep) {
        const routingErrorMessage = `Can't find path to room ${creep.memory.assignedRoom}! I'm at x: ${creep.pos.x} y: ${creep.pos.y} room: ${creep.room.name}`;
        const route = Game.map.findRoute(creep.room, creep.memory.assignedRoom!);
        if (route == ERR_NO_PATH) {
            console.log(routingErrorMessage);
        } else {
            const exit = creep.pos.findClosestByRange(route[0].exit);
            if (!exit) return console.log(routingErrorMessage);
            creep.moveTo(exit);
        }
    }

    private isInAssignedRoom(creep: Creep) {
        return creep.memory.assignedRoom === creep.room.name;
    }
}

const scoutBehavior = new ScoutBehavior();
export default scoutBehavior;
