class HaulerBehavior implements RoleBehavior {
    run(creep: Creep) {
        const source = Game.getObjectById(creep.memory.assignedSource ?? ("" as Id<Source>));
        if (!source) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        if (creep.memory.working) {
            if (creep.memory.home !== creep.room.name) {
                creep.travelTo(Game.rooms[creep.memory.home].spawn, {range: 2});
                creep.getOffExit();
            } else {
                creep.fillSpawnsWithEnergy();
            }
        } else {
            if (creep.memory.assignedRoom != creep.room.name) {
                creep.moveToAssignedRoom();
            } else {
                this.pickupEnergyNearSource(creep, source);
                creep.getOffExit();
            }
        }

        creep.giveWay();
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
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
