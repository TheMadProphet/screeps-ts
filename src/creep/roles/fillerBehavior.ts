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
        const towersWithMissingEnergy = this.findTowersWithMissingEnergy(creep);

        const missingEnergyInSpawnsAndExtensions = room.energyCapacityAvailable - room.energyAvailable;
        const missingEnergyInTowers = _.sum(towersWithMissingEnergy, tower =>
            tower.store.getFreeCapacity(RESOURCE_ENERGY)
        );
        const missingEnergyInStorageLink = room.storageLink?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0;
        const totalMissingEnergy =
            missingEnergyInSpawnsAndExtensions + missingEnergyInTowers + missingEnergyInStorageLink;

        if (totalMissingEnergy === 0) {
            creep.idle();
            return;
        }

        creep.withdrawFrom(storage);
        if (creep.pos.isNearTo(storage)) creep.memory.working = true;
    }

    private fill(creep: Creep, storage: StructureStorage) {
        const storageLink = creep.room.storageLink;
        const storageEnergy = storage.store[RESOURCE_ENERGY];

        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.fillSpawnsWithEnergy();
        } else if (storageLink && !storageLink.isFull()) {
            creep.transferTo(storageLink);
        } else if (creep.room.terminal && storageEnergy > 250000) {
            creep.transferTo(creep.room.terminal, RESOURCE_ENERGY);
        } else {
            const towersWithMissingEnergy = this.findTowersWithMissingEnergy(creep);

            if (towersWithMissingEnergy.length > 0) {
                creep.transferTo(towersWithMissingEnergy[0]);
            } else {
                creep.transferTo(storage);
            }
        }
    }

    private findTowersWithMissingEnergy(creep: Creep) {
        return creep.room
            .find(FIND_MY_STRUCTURES, {
                filter: (structure): structure is StructureTower =>
                    structure.structureType === STRUCTURE_TOWER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200
            })
            .sort((a, b) => a.store.getFreeCapacity(RESOURCE_ENERGY) - b.store.getFreeCapacity(RESOURCE_ENERGY));
    }
}

const fillerBehavior = new FillerBehavior();
export default fillerBehavior;
