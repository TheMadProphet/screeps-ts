import linkManager from "../../room/linkManager";

// Amount of minerals to keep in storage before filling terminal with them
const MINERAL_THRESHOLD = 25000;
// Amount of energy to keep in storage before filling terminal with them
const ENERGY_THRESHOLD = 500000;

class FillerBehavior implements RoleBehavior {
    public run(creep: Creep) {
        if (!creep.room.storage) return;
        const storage = creep.room.storage;
        const terminal = creep.room.terminal;

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        // Energy work
        if (!creep.memory.working) {
            if (this.shouldFillEnergy(creep, storage)) {
                this.gatherEnergy(creep, storage);
                return;
            }
        } else if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            const shouldGetEnergyFromStorage = this.fill(creep, storage);
            if (shouldGetEnergyFromStorage && creep.pos.isNearTo(storage)) {
                creep.withdraw(storage, RESOURCE_ENERGY);
            }
            return;
        }

        // Mineral work
        if (!creep.memory.working) {
            if (terminal && terminal.store.getFreeCapacity() > 0) {
                const withdrew = this.gatherMinerals(creep, storage, terminal);
                if (withdrew) return;
            }
        } else if (terminal) {
            creep.transferTo(terminal, Object.keys(creep.store)[0] as ResourceConstant);
            return;
        }

        // No work to do, idle
        creep.idle();
    }

    private gatherEnergy(creep: Creep, storage: StructureStorage) {
        let target: StructureStorage | StructureTerminal | StructureLink = storage;

        if (linkManager.shouldEmptyStorageLink(creep.room)) {
            target = creep.room.storageLink!;
        } else if (this.shouldTakeFromTerminal(creep, storage)) {
            target = creep.room.terminal!;
        }

        creep.withdrawFrom(target);
        if (creep.pos.isNearTo(target)) creep.memory.working = true;
    }

    private gatherMinerals(creep: Creep, storage: StructureStorage, terminal: StructureTerminal) {
        const energy = storage.store.getUsedCapacity(RESOURCE_ENERGY);
        const totalMinerals = storage.store.getUsedCapacity() - energy;
        if (totalMinerals < MINERAL_THRESHOLD) return false;

        for (const resourceType in storage.store) {
            const amount = storage.store[resourceType as ResourceConstant];
            if (resourceType !== RESOURCE_ENERGY && amount > MINERAL_THRESHOLD) {
                creep.withdrawFrom(
                    storage,
                    resourceType as ResourceConstant,
                    Math.min(
                        amount - MINERAL_THRESHOLD,
                        creep.store.getFreeCapacity(),
                        terminal.store.getFreeCapacity(resourceType as ResourceConstant)
                    )
                );
                return true;
            }
        }

        return false;
    }

    // Returns true if it should pickup energy from storage
    private fill(creep: Creep, storage: StructureStorage) {
        const terminal = creep.room.terminal;

        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
            creep.fillSpawnsWithEnergy();
            return true;
        }

        const towersWithMissingEnergy = this.findTowersWithMissingEnergy(creep);
        if (towersWithMissingEnergy.length > 0) {
            creep.transferTo(towersWithMissingEnergy[0]);
            return true;
        }

        if (linkManager.shouldFillStorageLink(creep.room)) {
            creep.transferTo(creep.room.storageLink!);
            return true;
        }

        if (
            terminal &&
            terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            terminal.store.getUsedCapacity(RESOURCE_ENERGY) < terminal.store.getUsedCapacity() / 3
        ) {
            creep.transferTo(terminal, RESOURCE_ENERGY);
            return false;
        }

        if (terminal && storage.store[RESOURCE_ENERGY] > ENERGY_THRESHOLD * 0.95) {
            creep.transferTo(terminal, RESOURCE_ENERGY);
            return false;
        }

        creep.transferTo(storage);
        return false;
    }

    private shouldFillEnergy(creep: Creep, storage: StructureStorage): boolean {
        const terminal = creep.room.terminal;

        // Fill spawns
        if (creep.room.energyCapacityAvailable !== creep.room.energyAvailable) return true;

        // Fill towers
        if (this.findTowersWithMissingEnergy(creep).length > 0) return true;

        // Fill storage link
        if (linkManager.shouldFillStorageLink(creep.room)) return true;

        // Fill terminal if storage has a lot of energy
        if (
            storage.store.getUsedCapacity(RESOURCE_ENERGY) > creep.room.energyCapacityAvailable * 2 &&
            terminal &&
            terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            (terminal.store.getUsedCapacity(RESOURCE_ENERGY) < terminal.store.getUsedCapacity() / 3 ||
                storage.store[RESOURCE_ENERGY] > ENERGY_THRESHOLD)
        )
            return true;

        // Take from terminal if it has a lot of energy
        if (this.shouldTakeFromTerminal(creep, storage)) return true;

        return false;
    }

    private shouldTakeFromTerminal(creep: Creep, storage: StructureStorage): boolean {
        const terminal = creep.room.terminal;
        if (!terminal) return false;

        // Take from terminal if it has a lot of energy and storage has little energy
        return (
            terminal.store.getUsedCapacity(RESOURCE_ENERGY) > terminal.store.getUsedCapacity() / 3 &&
            storage.store.getUsedCapacity(RESOURCE_ENERGY) < 100000
        );
    }

    private findTowersWithMissingEnergy(creep: Creep) {
        return creep.room
            .find(FIND_MY_STRUCTURES, {
                filter: (structure): structure is StructureTower =>
                    structure.structureType === STRUCTURE_TOWER &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 500
            })
            .sort((a, b) => a.store.getFreeCapacity(RESOURCE_ENERGY) - b.store.getFreeCapacity(RESOURCE_ENERGY));
    }
}

const fillerBehavior = new FillerBehavior();
export default fillerBehavior;
