export {};

declare global {
    interface StructureLink {
        automate(): void;

        isFull(): boolean;

        isEmpty(): boolean;
    }
}

class ExtendedLink extends StructureLink {
    @AddToPrototype
    public automate() {
        if (this.cooldown > 0) return;

        if (this.isStorageLink()) {
            this.automateStorageLink();
        } else if (!this.isControllerLink()) {
            this.automateSourceLink();
        }
    }

    @AddToPrototype
    private automateStorageLink() {
        const controllerLink = this.room.controllerLink;
        const storage = this.room.storage;
        if (!controllerLink || !storage) return;

        if (
            controllerLink.isEmpty() &&
            this.isFull() &&
            storage.store[RESOURCE_ENERGY] > this.room.energyCapacityAvailable * 2
        ) {
            this.transferEnergy(controllerLink);
        }
    }

    @AddToPrototype
    private automateSourceLink() {
        const storageLink = this.room.storageLink;
        if (this.isFull() && storageLink && storageLink.isEmpty()) {
            this.transferEnergy(storageLink);
        }
    }

    @AddToPrototype
    private isStorageLink() {
        return (this.id as string) === this.room.storageLink?.id;
    }

    @AddToPrototype
    private isControllerLink() {
        return (this.id as string) == this.room.controllerLink?.id;
    }

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
