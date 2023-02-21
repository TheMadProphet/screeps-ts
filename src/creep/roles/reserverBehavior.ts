class ReserverBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        if (this.isInAssignedRoom(creep)) {
            const controller = creep.room.controller;

            if (!controller) {
                creep.getOffExit();
                creep.say("⚠");
                return;
            }

            if (creep.pos.isNearTo(controller)) {
                creep.reserveController(controller);
            } else {
                creep.moveTo(controller);
            }
        } else {
            creep.moveToAssignedRoom();
        }
    }

    private isInAssignedRoom(creep: Creep) {
        return creep.memory.assignedRoom === creep.room.name;
    }
}

const reserverBehavior = new ReserverBehavior();
export default reserverBehavior;
