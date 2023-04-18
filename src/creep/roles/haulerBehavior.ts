class HaulerBehavior implements RoleBehavior {
    public run(creep: Creep) {
        const assignedSource = creep.memory.assignedSource;
        if (!assignedSource) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() <= 5) this.onWorkStart(creep);
        if (creep.memory.working && creep.store.getUsedCapacity() === 0) this.onWorkDone(creep, assignedSource);

        if (creep.memory.working) {
            this.retrieveEnergy(creep);
        } else {
            this.gatherEnergy(creep, assignedSource);
        }

        if (creep.getActiveBodyparts(WORK) > 0) {
            this.maintainInfrastructure(creep);
        }

        creep.giveWay();
    }

    private onWorkDone(creep: Creep, sourceId: Id<Source>) {
        creep.memory.working = false;
        if (!this.hasEnoughTimeToHaulOnce(creep, sourceId)) {
            creep.suicide();
        }
    }

    private onWorkStart(creep: Creep) {
        creep.memory.working = true;
    }

    private retrieveEnergy(creep: Creep) {
        if (creep.isHome()) {
            creep.getOffExit();

            if (creep.room.storage) {
                creep.transferTo(creep.room.storage);
            } else {
                creep.fillSpawnsWithEnergy();
            }
        } else {
            creep.travelToHome();
        }
    }

    private gatherEnergy(creep: Creep, sourceId: Id<Source>) {
        creep.getOffExit();

        const source = Game.getObjectById(sourceId);
        if (source) {
            this.pickupEnergyNearSource(creep, source);
            if (source.container) {
                if (creep.pos.isNearTo(source.container)) {
                    creep.withdraw(source.container, RESOURCE_ENERGY);
                } else {
                    creep.travelTo(source.container, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
                }
            }
        } else {
            creep.travelToAssignedRoom();
        }
    }

    private pickupEnergyNearSource(creep: Creep, source: Source) {
        const droppedEnergies = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === RESOURCE_ENERGY
        });

        if (!droppedEnergies?.length) {
            creep.giveWay();
        } else if (creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(droppedEnergies[0], {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        }
    }

    private maintainInfrastructure(creep: Creep) {
        if (creep.isHome()) return;

        const damagedContainers = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: it => it.structureType === STRUCTURE_CONTAINER && it.hitsMax - it.hits > 100
        });

        if (damagedContainers.length > 0) {
            creep.repair(damagedContainers[0]);
            return;
        }

        const damagedRoads = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: it => it.structureType === STRUCTURE_ROAD && it.hitsMax - it.hits > 100
        });

        if (damagedRoads.length > 0) {
            creep.repair(damagedRoads[0]);
        }
    }

    private hasEnoughTimeToHaulOnce(creep: Creep, sourceId: Id<Source>): boolean {
        const pathCost = Memory.sources[sourceId].pathCost;

        if (!creep.ticksToLive) return true;

        return creep.ticksToLive > pathCost * 1.1;
    }
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
