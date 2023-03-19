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
    }

    interface Source {
        memory: SourceMemory;
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
