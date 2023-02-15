const haulerBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (creep.store.getUsedCapacity() > 0) {
            creep.fillSpawnsWithEnergy();
        } else {
            const closestDroppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: resource =>
                    resource.resourceType === RESOURCE_ENERGY &&
                    resource.amount >= creep.getActiveBodyparts(CARRY) * CARRY_CAPACITY * 0.8
            });

            if (closestDroppedEnergy && creep.pickup(closestDroppedEnergy) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDroppedEnergy, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        }
    }
};

export default haulerBehavior;
