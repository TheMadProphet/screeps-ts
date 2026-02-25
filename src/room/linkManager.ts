class LinkManager {
    public automate(room: Room) {
        if (!room.storageLink || !room.controllerLink) return;

        let wasControllerLinkFilled = false;
        const shouldFillControllerLink = this.shouldFillControllerLink(room);

        const sourceLinkIds = room.memory.sourceLinkIds ?? [];
        for (const sourceLinkId of sourceLinkIds) {
            const sourceLink = Game.getObjectById(sourceLinkId);
            if (!sourceLink || !this.readyForTransfer(sourceLink)) continue;

            if (!wasControllerLinkFilled && shouldFillControllerLink) {
                sourceLink.transferEnergy(room.controllerLink);
                wasControllerLinkFilled = true;
            } else if (room.storageLink.isEmpty()) {
                sourceLink.transferEnergy(room.storageLink);
            }
        }

        if (!wasControllerLinkFilled && shouldFillControllerLink && this.readyForTransfer(room.storageLink)) {
            room.storageLink.transferEnergy(room.controllerLink);
        }
    }

    public shouldFillStorageLink(room: Room) {
        if (!room.storageLink) return false;

        return !this.roomHasSourceLinks(room) && !room.storageLink.isFull();
    }

    public shouldEmptyStorageLink(room: Room) {
        if (!room.storageLink) return false;

        return this.roomHasSourceLinks(room) && !room.storageLink.isEmpty();
    }

    private shouldFillControllerLink(room: Room) {
        if (!room.controllerLink) return false;

        const storage = room.storage;
        return (
            room.controllerLink.isEmpty() &&
            storage &&
            storage.store[RESOURCE_ENERGY] > room.energyCapacityAvailable * 2
        );
    }

    private readyForTransfer(link: StructureLink) {
        return link.cooldown === 0 && link.isFull();
    }

    private roomHasSourceLinks(room: Room) {
        return room.memory.sourceLinkIds && room.memory.sourceLinkIds.length > 0;
    }
}

const linkManager = new LinkManager();
export default linkManager;
