import roomGrid from "../grid/roomGrid";
import {Traveler} from "../../utils/traveler/traveler";

declare global {
    interface RoomMemory {
        controllerLinkPos?: {x: number; y: number};
    }
}

const gridStructures: BuildableStructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    // STRUCTURE_EXTRACTOR,
    STRUCTURE_TERMINAL,
    // STRUCTURE_LAB,
    STRUCTURE_FACTORY,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_NUKER
];

class RoomStructures {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    build() {
        if (!this.room.controller) return;
        if (Game.time % 5 !== 0) return;
        if (this.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) return;

        for (const structure of gridStructures) {
            if (this.room.canBuildStructure(structure)) {
                this.buildStructure(structure);
            }
        }

        if (!this.room.storageLink) {
            this.buildStorageLink();
        } else if (!this.room.controllerLink) {
            this.buildControllerLink();
        }
    }

    private buildStructure(structure: BuildableStructureConstant) {
        const pos = roomGrid.getPositionForStructure(this.room, structure);
        if (!pos) {
            return console.log(`Cannot find position for ${structure}`);
        }

        const constructionStatus = this.room.createConstructionSite(pos.x, pos.y, structure);
        if (constructionStatus !== OK) {
            return console.log(`${structure} build failed with status ${constructionStatus}`);
        }
    }

    private buildStorageLink() {
        if (!this.room.storage || !this.room.memory.gridCenter) return;

        const linkPos = {x: this.room.memory.gridCenter.x, y: this.room.memory.gridCenter.y - 1};
        const structure = this.room.lookForAt(LOOK_STRUCTURES, linkPos.x, linkPos.y)[0];
        if (structure) {
            if (structure.structureType === STRUCTURE_LINK) {
                this.room.memory.storageLinkId = structure.id as Id<StructureLink>;
            } else {
                console.error("Position for storage link has been already used");
            }
        } else if (this.room.canBuildStructure(STRUCTURE_LINK)) {
            this.room.createConstructionSite(linkPos.x, linkPos.y, STRUCTURE_LINK);
        }
    }

    private buildControllerLink() {
        if (!this.room.controller || !this.room.storage) return;

        if (this.room.memory.controllerLinkPos) {
            const linkPos = this.room.memory.controllerLinkPos;
            const link = this.room
                .lookForAt(LOOK_STRUCTURES, linkPos.x, linkPos.y)
                .find(it => it.structureType === STRUCTURE_LINK);

            if (link) {
                this.room.memory.controllerLinkId = link.id as Id<StructureLink>;
                delete this.room.memory.controllerLinkPos;
            }
        } else if (this.room.canBuildStructure(STRUCTURE_LINK)) {
            const path = Traveler.findTravelPath(this.room.storage, this.room.controller, {range: 2}).path;
            const linkPos = path.pop();
            if (!linkPos) {
                console.error("Error finding position for controller link");
            } else {
                this.room.createConstructionSite(linkPos.x, linkPos.y, STRUCTURE_LINK);
                this.room.memory.controllerLinkPos = linkPos;
            }
        }
    }
}

export default RoomStructures;
