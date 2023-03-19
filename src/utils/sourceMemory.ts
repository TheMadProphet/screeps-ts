import {getAvailablePositionsAround} from "../creep/roomScanner";

export {};

declare global {
    interface Memory {
        sources: Record<Id<Source>, SourceMemory>;
    }

    interface SourceMemory {
        id: Id<Source>;
        spaceAvailable: number;
        pathCost: number;
        containerId?: Id<StructureContainer>;
        containerConstructionStarted?: boolean;
    }

    interface Source {
        memory: SourceMemory;
        container: StructureContainer | undefined;
    }
}

Object.defineProperty(Source.prototype, "memory", {
    get: function () {
        if (!Memory.sources) Memory.sources = {};

        if (!Memory.sources[this.id]) {
            Memory.sources[this.id] = {
                id: this.id,
                spaceAvailable: getAvailablePositionsAround(this).length,
                pathCost: Infinity
            };
        }

        return Memory.sources[this.id];
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Source.prototype, "container", {
    get: function () {
        const containerId = this.memory.containerId;
        if (!containerId) return undefined;

        return Game.getObjectById(containerId) ?? undefined;
    },
    enumerable: false,
    configurable: true
});
