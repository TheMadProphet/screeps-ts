export {};

declare global {
    interface StructureLink {
        isFull(): boolean;

        isEmpty(): boolean;
    }
}

class ExtendedLink extends StructureLink {
    @AddToPrototype
    public isFull() {
        return this.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
    }

    @AddToPrototype
    public isEmpty() {
        return this.store.getUsedCapacity(RESOURCE_ENERGY) === 0;
    }
}

function AddToPrototype(target: any, methodName: string, descriptor: PropertyDescriptor) {
    // @ts-ignore
    StructureLink.prototype[methodName] = function (...args: any[]) {
        return descriptor.value.apply(this, args);
    };
}
