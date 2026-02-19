const BASE_ENERGY_THRESHOLD = 100000;

class KingdomEconomy {
    public exchangeEnergies(room: Room) {
        if (this.needsEnergy(room)) {
            Memory.kingdom.energyNeeds[room.name] = true;
        } else {
            delete Memory.kingdom.energyNeeds[room.name];

            if (this.canSendEnergy(room) && Object.entries(Memory.kingdom.energyNeeds).length > 0) {
                room.terminal!.send(RESOURCE_ENERGY, 10000, Object.keys(Memory.kingdom.energyNeeds)[0]);
            }
        }
    }

    private needsEnergy(room: Room): boolean {
        if (!room.storage && !room.terminal) return false;

        const storageEnergy = room.storage?.store[RESOURCE_ENERGY] || 0;
        const terminalEnergy = room.terminal?.store[RESOURCE_ENERGY] || 0;
        return storageEnergy + terminalEnergy < BASE_ENERGY_THRESHOLD;
    }

    private canSendEnergy(room: Room): boolean {
        if (!room.storage || !room.terminal) return false;
        if (room.terminal.cooldown > 0) return false;

        const terminalEnergy = room.terminal.store[RESOURCE_ENERGY] || 0;
        return terminalEnergy > 10000 && terminalEnergy * 2 > room.terminal.store.getUsedCapacity();
    }
}

const kingdomEconomy = new KingdomEconomy();
export default kingdomEconomy;
