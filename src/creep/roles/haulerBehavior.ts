class HaulerBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        if (creep.memory.working) {
            this.retrieveEnergy(creep);
        } else {
            this.gatherEnergy(creep, creep.memory.assignedSource);
        }

        creep.giveWay();
    }

    retrieveEnergy(creep: Creep) {
        if (creep.memory.home !== creep.room.name) {
            creep.travelTo(Game.rooms[creep.memory.home].spawn, {range: 2});
            creep.getOffExit();
        } else {
            creep.fillSpawnsWithEnergy();
        }
    }

    gatherEnergy(creep: Creep, sourceId: Id<Source>) {
        if (creep.memory.assignedRoom != creep.room.name) {
            creep.moveToAssignedRoom();
        } else {
            creep.getOffExit();

            const container = this.findContainerForSource(creep, sourceId);
            if (container) {
                creep.withdrawFrom(container);
            } else {
                const source = Game.getObjectById(sourceId);
                if (source) {
                    this.pickupEnergyNearSource(creep, source);
                }
            }
        }
    }

    pickupEnergyNearSource(creep: Creep, source: Source) {
        const droppedEnergies = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === RESOURCE_ENERGY
        });

        if (!droppedEnergies?.length) {
            creep.giveWay();
        } else if (creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(droppedEnergies[0]);
        }
    }

    findContainerForSource(creep: Creep, sourceId: Id<Source>): StructureContainer | undefined {
        const containerId = Memory.sources[sourceId].containerId;
        if (!containerId) return undefined;

        return Game.getObjectById(containerId) ?? undefined;
    }
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
