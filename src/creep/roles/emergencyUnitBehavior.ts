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

    // TODO: take from containers
    private gatherEnergy(creep: Creep) {
        const resources = creep.room.find(FIND_DROPPED_RESOURCES);
        if (resources.length) {
            creep.pickupResource(resources[0]);
        } else {
            this.mineSources(creep);
        }
    }

    private mineSources(creep: Creep) {
        const sources = creep.room.find(FIND_SOURCES, {filter: source => source.energy > 0});

        if (sources.length) {
            creep.harvestFrom(sources[0]);
        }
    }
}

const emergencyUnitBehavior = new EmergencyUnitBehavior();
export default emergencyUnitBehavior;
