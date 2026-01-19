import {RESERVER} from "../../constants";

class ReserverBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            creep.say("⚠");
            return;
        }

        const controller = Game.rooms[creep.memory.assignedRoom]?.controller;
        if (controller) {
            this.reserveController(creep, controller);
        } else {
            creep.travelToAssignedRoom();
        }
    }

    private reserveController(creep: Creep, controller: StructureController) {
        if (creep.pos.isNearTo(controller)) {
            creep.reserveController(controller);

            if (creep.memory.excuseMe) {
                const creepsNudging = creep.pos.fromDirection(creep.memory.excuseMe).lookFor(LOOK_CREEPS);
                if (creepsNudging.some(it => it.memory?.role === RESERVER)) {
                    creep.suicide();
                }
            }
        } else {
            creep.travelTo(controller, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        }
    }
}

const reserverBehavior = new ReserverBehavior();
export default reserverBehavior;
