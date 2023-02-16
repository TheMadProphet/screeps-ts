interface HaulerBehavior extends RoleBehavior {
    pickupEnergyNearSource(creep: Creep, source: Source): void;
}

const haulerBehavior: HaulerBehavior = {
    run: function (creep: Creep) {
        const source = Game.getObjectById(creep.memory.assignedSource ?? ("" as Id<Source>)) as Source;
        if (!source) {
            creep.say("⚠");
            return;
        }

        if (creep.store.getUsedCapacity() > 0) {
            creep.fillSpawnsWithEnergy();
        } else {
            this.pickupEnergyNearSource(creep, source);
        }
    },

    pickupEnergyNearSource(creep: Creep, source: Source) {
        if (!creep.pos.inRangeTo(source, 2)) {
            const pathFromSpawn = creep.room.memory!.sources[source.id].pathFromSpawn;
            if (creep.moveByPath(pathFromSpawn) === ERR_NOT_FOUND) {
                creep.moveTo(pathFromSpawn[0].x, pathFromSpawn[0].y);
            }
        } else {
            const droppedEnergies = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {
                filter: resource =>
                    resource.resourceType === RESOURCE_ENERGY &&
                    resource.amount >= creep.getActiveBodyparts(CARRY) * CARRY_CAPACITY * 0.9
            });

            if (droppedEnergies[0] && creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedEnergies[0], {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        }
    }
};

export default haulerBehavior;
