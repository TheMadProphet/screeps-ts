class FillerBehavior implements RoleBehavior {
    towersWithMissingEnergy: StructureTower[] = [];

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
        this.findTowersWithMissingEnergy(creep);

        const missingEnergyInSpawnsAndExtensions = room.energyCapacityAvailable - room.energyAvailable;
        const missingEnergyInTowers = _.sum(this.towersWithMissingEnergy, tower =>
            tower.store.getFreeCapacity(RESOURCE_ENERGY)
        );
        const missingEnergyInStorageLink = room.storageLink?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0;
        const totalMissingEnergy =
            missingEnergyInSpawnsAndExtensions + missingEnergyInTowers + missingEnergyInStorageLink;

        if (totalMissingEnergy === 0) {
            creep.idle();
            return;
        }

        const amountToWithdraw = Math.min(totalMissingEnergy, creep.store.getFreeCapacity(RESOURCE_ENERGY));
        creep.withdrawFrom(storage, RESOURCE_ENERGY, amountToWithdraw);
        if (creep.pos.isNearTo(storage)) creep.memory.working = true;
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
        } else if (this.towersWithMissingEnergy.length > 0) {
            creep.transferTo(this.towersWithMissingEnergy[0]);
        } else {
            creep.transferTo(storage);
        }
    }

    private findTowersWithMissingEnergy(creep: Creep) {
        this.towersWithMissingEnergy = creep.room.find(FIND_MY_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
    }
}

const fillerBehavior = new FillerBehavior();
export default fillerBehavior;
