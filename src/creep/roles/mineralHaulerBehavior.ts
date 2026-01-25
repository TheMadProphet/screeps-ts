class MineralHaulerBehavior implements RoleBehavior {
    public run(creep: Creep) {
        const assignedMineral = creep.memory.assignedMineral;

        if (!assignedMineral) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() <= 5) {
            creep.memory.working = true;
        }
        if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = false;
            if (!this.hasEnoughTimeToHaulOnce(creep, assignedMineral)) {
                creep.suicide();
            }
        }

        if (creep.memory.working) {
            this.deliverMineral(creep);
        } else {
            this.gatherMineral(creep, assignedMineral);
        }

        creep.giveWay();
    }

    private gatherMineral(creep: Creep, mineralId: Id<Mineral>) {
        creep.getOffExit();

        const mineral = Game.getObjectById(mineralId);
        if (!mineral) {
            creep.idle();
            creep.say("No mineral");
            return;
        }

        this.pickupMineralsNearMineral(creep, mineral);

        if (mineral.container) {
            if (creep.pos.isNearTo(mineral.container)) {
                creep.withdraw(mineral.container, mineral.mineralType);
            } else {
                creep.travelTo(mineral.container);
            }
        } else {
            creep.idle();
            creep.say("No container");
        }
    }

    private pickupMineralsNearMineral(creep: Creep, mineral: Mineral) {
        const droppedMinerals = mineral.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === mineral.mineralType
        });

        if (!droppedMinerals?.length) {
            creep.giveWay();
        } else if (creep.pickup(droppedMinerals[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(droppedMinerals[0]);
        }
    }

    private deliverMineral(creep: Creep) {
        creep.getOffExit();

        if (creep.room.storage) {
            if (creep.pos.isNearTo(creep.room.storage)) {
                for (const resourceType in creep.store) {
                    if (creep.store[resourceType as ResourceConstant] > 0) {
                        creep.transfer(creep.room.storage, resourceType as ResourceConstant);
                        break;
                    }
                }
            } else {
                creep.travelTo(creep.room.storage);
            }
        } else {
            creep.idle();
            creep.say("No storage");
        }
    }

    private hasEnoughTimeToHaulOnce(creep: Creep, mineralId: Id<Mineral>): boolean {
        const pathCost = Memory.minerals[mineralId]?.pathCost;
        if (!pathCost || !creep.ticksToLive) return true;

        return creep.ticksToLive > pathCost * 1.1;
    }
}

const mineralHaulerBehavior = new MineralHaulerBehavior();
export default mineralHaulerBehavior;
