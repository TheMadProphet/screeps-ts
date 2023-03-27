import {RESERVER} from "../../constants";

class ReserverBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        if (creep.isInAssignedRoom()) {
            if (creep.room.controller) {
                this.reserveController(creep, creep.room.controller);
            }
        } else {
            creep.travelToAssignedRoom();
        }
    }

    private reserveController(creep: Creep, controller: StructureController) {
        if (creep.pos.isNearTo(controller)) {
            creep.reserveController(controller);

            if (creep.memory.excuseMe) {
                const creepsNudging = creep.pos.fromDirection(creep.memory.excuseMe).lookFor(LOOK_CREEPS);
                if (creepsNudging.some(it => it.memory.role === RESERVER)) {
                    creep.suicide();
                }
            }
        } else {
            creep.travelTo(controller);
        }
    }
}

const reserverBehavior = new ReserverBehavior();
export default reserverBehavior;
