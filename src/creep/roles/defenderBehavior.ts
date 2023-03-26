import roomDefense from "../roomDefense";

class DefenderBehavior implements RoleBehavior {
    public run(creep: Creep) {
        if (!creep.memory.assignedRoom) {
            const roomToDefend = roomDefense.getRoomToDefend(creep);
            if (!roomToDefend) {
                return creep.idle();
            } else {
                creep.memory.assignedRoom = roomToDefend;
            }
        }

        if (creep.isInAssignedRoom()) {
            creep.getOffExit();
            this.defendCurrentRoom(creep);
        } else {
            creep.travelToAssignedRoom();
        }
    }

    private defendCurrentRoom(creep: Creep) {
        const invaders = creep.room.find(FIND_HOSTILE_CREEPS).filter(it => it.owner.username === "Invader");

        if (invaders.length < 1) {
            creep.memory.assignedRoom = undefined;
        } else {
            const target = this.findTargetToAttack(invaders);
            if (target) {
                creep.travelTo(target, {movingTarget: true});
                creep.attack(target);
            }
        }
    }

    private findTargetToAttack(hostiles: Creep[]): Creep | undefined {
        const healers = hostiles
            .filter(it => it.getActiveBodyparts(HEAL) > 0)
            .sort((a, b) => a.getActiveBodyparts(HEAL) - b.getActiveBodyparts(HEAL));
        if (healers.length) {
            return healers[0];
        }

        return hostiles[0];
    }
}

const defenderBehavior = new DefenderBehavior();
export default defenderBehavior;
