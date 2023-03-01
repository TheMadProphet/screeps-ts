import {getSpaceAroundSource} from "../creep/roomScanner";

export {};

declare global {
    interface Memory {
        sources: Record<Id<Source>, SourceMemory>;
    }

    interface SourceMemory {
        id: Id<Source>;
        spaceAvailable: number;
        distanceToSpawn: number;
    }

    interface Source {
        memory: SourceMemory;
    }
}

Object.defineProperty(Source.prototype, "memory", {
    get: function () {
        if (!Memory.sources[this.id]) {
            Memory.sources[this.id] = {
                id: this.id,
                spaceAvailable: getSpaceAroundSource(this),
                distanceToSpawn: Infinity
            };
        }

        return Memory.sources[this.id];
    },
    enumerable: false,
    configurable: true
});
