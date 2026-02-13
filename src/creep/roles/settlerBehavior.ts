export const settlerTasks = {
    HAUL: "haul",
    WORK: "work",
    CLAIM: "claim"
} as const;

export type SettlerTask = (typeof settlerTasks)[keyof typeof settlerTasks];

declare global {
    interface CreepMemory {
        settlerTask?: SettlerTask;
    }
}

class SettlerBehavior implements RoleBehavior {
    run(creep: Creep): void {
        switch (creep.memory.settlerTask) {
            case settlerTasks.HAUL:
                this.runHaulTask(creep);
                break;
            case settlerTasks.WORK:
                this.runWorkTask(creep);
                break;
            case settlerTasks.CLAIM:
                this.runClaimTask(creep);
                break;
        }
    }

    private runWorkTask(creep: Creep) {
        if (!creep.isInAssignedRoom()) return this.travelToTargetRoom(creep);

        const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (enemyStructures[0]) {
            if (creep.dismantle(enemyStructures[0]) === ERR_NOT_IN_RANGE) {
                creep.travelTo(enemyStructures[0]);
            }
            return;
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            if (creep.room.spawn && creep.room.spawn.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                creep.withdrawFrom(creep.room.spawn);
                return;
            }
            const droppedResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: it => it.resourceType === RESOURCE_ENERGY
            });
            if (droppedResource) {
                creep.pickupResource(droppedResource);
            } else {
                creep.say("Energy?");
                creep.travelTo(this.getSettleFlag(creep), {range: 2});
            }

            return;
        }

        const controller = creep.room.controller!;
        if (controller.my && controller.ticksToDowngrade < 1000) {
            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(controller);
            }
            return;
        }

        const constructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSite) {
            if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite, {ignoreCreeps: false, range: 3});
            }
            return;
        }

        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        if (!spawn) {
            creep.room.createConstructionSite(this.getSettleFlag(creep).pos, STRUCTURE_SPAWN);
            return;
        }

        if (controller.my) {
            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
                creep.travelTo(controller);
            }
            return;
        }

        creep.say("⚠");
    }

    private runHaulTask(creep: Creep) {
        if (creep.store.getUsedCapacity() === 0) return creep.withdrawEnergy();
        if (!creep.isInAssignedRoom()) return this.travelToTargetRoom(creep);

        if (creep.room.energyCapacityAvailable !== creep.room.energyAvailable) {
            creep.fillSpawnsWithEnergy();
            return;
        }

        if (creep.room.storage) {
            creep.transferTo(creep.room.storage);
            return;
        }

        const nearbyWorker = creep.room.find(FIND_MY_CREEPS, {
            filter: it => it.memory.settlerTask === settlerTasks.WORK
        })[0];

        if (nearbyWorker) {
            creep.transferTo(nearbyWorker);
        } else if (this.getSettleFlag(creep)) {
            const flag = this.getSettleFlag(creep);
            if (creep.pos.inRangeTo(flag, 1)) {
                creep.drop(RESOURCE_ENERGY);
            } else {
                creep.travelTo(flag, {range: 1});
            }
        } else {
            creep.idle();
        }
    }

    private runClaimTask(creep: Creep) {
        if (!creep.isInAssignedRoom()) return this.travelToTargetRoom(creep);
        const controller = creep.room.controller!;

        if (creep.claimController(controller) === ERR_NOT_IN_RANGE) {
            creep.travelTo(controller);
        }
    }

    private travelToTargetRoom(creep: Creep) {
        creep.travelTo(this.getSettleFlag(creep) || Game.rooms[creep.memory.assignedRoom!].controller, {range: 2});
    }

    private getSettleFlag(creep: Creep): Flag {
        const flagName = `settle_from_${creep.memory.home}`;
        return Game.flags[flagName];
    }
}

const workerBehavior = new SettlerBehavior();
export default workerBehavior;
