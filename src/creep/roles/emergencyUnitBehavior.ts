class EmergencyUnitBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = true;

        if (creep.memory.working) {
            this.gatherEnergy(creep);
        } else {
            creep.fillSpawnsWithEnergy();
        }
    }

    private gatherEnergy(creep: Creep) {
        // TODO: withdraw from storage
        const closestContainerWithEnergy = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: it => it.structureType === STRUCTURE_CONTAINER && it.store.getUsedCapacity() > 0
        });

        if (closestContainerWithEnergy) {
            creep.withdrawFrom(closestContainerWithEnergy);
            return;
        }

        const resources = creep.room.find(FIND_DROPPED_RESOURCES);
        if (resources.length) {
            creep.pickupResource(resources[0]);
        } else {
            this.mineSources(creep);
        }
    }

    private mineSources(creep: Creep) {
        const sourcesInRange = creep.pos.findInRange(FIND_SOURCES, 1);
        if (sourcesInRange.length > 0) {
            creep.harvest(sourcesInRange[0]);
            return;
        }

        const sources = creep.room.find(FIND_SOURCES, {filter: source => source.energy > 0});
        sources.sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));

        for (const source of sources) {
            const creepsNearSource = source.pos.findInRange(FIND_CREEPS, 1).length;
            if (source.memory.spaceAvailable > creepsNearSource) {
                creep.travelTo(source, {ignoreCreeps: false});
                break;
            }
        }
    }
}

const emergencyUnitBehavior = new EmergencyUnitBehavior();
export default emergencyUnitBehavior;
