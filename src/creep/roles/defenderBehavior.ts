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
            const target = this.findTargetToAttack(creep, invaders);
            if (target) {
                const isRanged = creep.getActiveBodyparts(RANGED_ATTACK) > 0;
                if (isRanged) {
                    if (creep.pos.getRangeTo(target) > 3) {
                        creep.travelTo(target, {movingTarget: true, range: 3});
                    } else {
                        const direction = creep.pos.getDirectionTo(target);
                        const oppositeDirection = (((direction + 3) % 8) + 1) as DirectionConstant;
                        creep.move(oppositeDirection);
                    }

                    creep.rangedAttack(target);
                    creep.heal(creep);
                } else {
                    creep.travelTo(target, {movingTarget: true});
                    creep.attack(target);
                }
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
