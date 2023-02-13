const haulerBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const closestDroppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType === RESOURCE_ENERGY
            });

            if (closestDroppedEnergy && creep.pickup(closestDroppedEnergy) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDroppedEnergy, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        } else {
            creep.fillSpawnsWithEnergy();
        }
    }
};

export default haulerBehavior;
