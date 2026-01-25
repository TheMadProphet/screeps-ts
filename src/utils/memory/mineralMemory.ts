export {};

declare global {
    interface Memory {
        minerals: Record<Id<Mineral>, MineralMemory>;
    }

    interface MineralMemory {
        id: Id<Mineral>;
        pathCost: number;
    }

    interface Mineral {
        memory: MineralMemory;
        container: StructureContainer | undefined;
    }
}

Object.defineProperty(Mineral.prototype, "memory", {
    get: function () {
        if (!Memory.minerals) Memory.minerals = {};

        if (!Memory.minerals[this.id]) {
            Memory.minerals[this.id] = {
                id: this.id,
                pathCost: Infinity
            };
        }

        return Memory.minerals[this.id];
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Mineral.prototype, "container", {
    get: function () {
        const containerId = this.memory.containerId;
        if (!containerId) return undefined;

        return Game.getObjectById(containerId) ?? undefined;
    },
    enumerable: false,
    configurable: true
});
