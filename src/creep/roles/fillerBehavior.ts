class FillerBehavior implements RoleBehavior {
    public run(creep: Creep) {
        if (!creep.room.storage) return;

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        if (!creep.memory.working) {
            this.gatherEnergy(creep, creep.room.storage);
        } else {
            this.fill(creep, creep.room.storage);
        }

        creep.giveWay();
    }

    private gatherEnergy(creep: Creep, storage: StructureStorage) {
        const room = creep.room;

        if (room.energyAvailable !== room.energyCapacityAvailable) {
            creep.withdrawFrom(storage, RESOURCE_ENERGY);
            if (creep.pos.isNearTo(storage)) creep.memory.working = true;
        } else if (!room.storageLink?.isFull()) {
            creep.withdrawFrom(storage, RESOURCE_ENERGY);
        } else {
            creep.idle();
        }
    }

    private fill(creep: Creep, storage: StructureStorage) {
        const storageLink = creep.room.storageLink;
        if (storageLink && !storageLink.isFull()) {
            creep.transferTo(storageLink);
            return;
        }

        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.fillSpawnsWithEnergy();
        } else if (creep.room.terminal && storage.store[RESOURCE_ENERGY] > 250000) {
            creep.transferTo(creep.room.terminal, RESOURCE_ENERGY);
        } else {
            const towersWithMissingEnergy = creep.room.find(FIND_MY_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (towersWithMissingEnergy.length) {
                creep.transferTo(towersWithMissingEnergy[0]);
                return;
            }

            creep.transferTo(storage);
        }
    }
}

const fillerBehavior = new FillerBehavior();
export default fillerBehavior;
