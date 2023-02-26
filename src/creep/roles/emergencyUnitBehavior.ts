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
        const resources = creep.room.find(FIND_DROPPED_RESOURCES);
        if (resources.length) {
            this.pickupEnergy(creep, resources[0]);
        } else {
            this.mineSources(creep);
        }
    }

    private pickupEnergy(creep: Creep, resource: Resource) {
        if (creep.pos.isNearTo(resource)) {
            creep.pickup(resource);
        } else {
            creep.travelTo(resource);
        }

        return;
    }

    private mineSources(creep: Creep) {
        const sources = creep.room.find(FIND_SOURCES, {filter: source => source.energy > 0});

        if (sources.length) {
            const source = sources[0];
            if (creep.pos.isNearTo(source)) {
                creep.harvest(source);
            } else {
                creep.travelTo(source);
            }
        }
    }
}

const emergencyUnitBehavior = new EmergencyUnitBehavior();
export default emergencyUnitBehavior;
