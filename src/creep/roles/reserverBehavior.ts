class ReserverBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        if (this.isInAssignedRoom(creep)) {
            const controller = creep.room.controller!;
            if (creep.pos.isNearTo(controller)) {
                creep.reserveController(controller);
            } else {
                creep.travelTo(controller);
            }
        } else {
            this.travelToAssignedRoom(creep);
        }
    }

    private isInAssignedRoom(creep: Creep) {
        return creep.memory.assignedRoom === creep.room.name;
    }

    private travelToAssignedRoom(creep: Creep) {
        creep.travelTo(new RoomPosition(25, 25, creep.memory.assignedRoom!));
    }
}

const reserverBehavior = new ReserverBehavior();
export default reserverBehavior;
