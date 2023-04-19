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
            const amountToWithdraw = Math.min(
                room.energyCapacityAvailable - room.energyAvailable,
                creep.store.getFreeCapacity()
            );

            creep.withdrawFrom(storage, RESOURCE_ENERGY, amountToWithdraw);
            if (creep.pos.isNearTo(storage)) creep.memory.working = true;
        } else if (room.terminal && (room.storage?.store[RESOURCE_ENERGY] ?? 0) > 250000) {
            creep.transferTo(room.terminal, RESOURCE_ENERGY);
        } else {
            creep.idle();
        }
    }

    private fill(creep: Creep, storage: StructureStorage) {
        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.fillSpawnsWithEnergy();
        } else {
            const towersWithMissingEnergy = creep.room.find(FIND_MY_STRUCTURES, {
                filter: structure =>
                    structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (towersWithMissingEnergy.length) {
                creep.transferTo(towersWithMissingEnergy[0]);
            } else {
                creep.transferTo(storage);
            }
        }
    }
}

const fillerBehavior = new FillerBehavior();
export default fillerBehavior;
