import roomGrid from "../grid/roomGrid";

const structuresToBuild: BuildableStructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_STORAGE,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_TERMINAL,
    STRUCTURE_LAB,
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
        if (this.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) return;

        for (const structure of structuresToBuild) {
            if (this.room.canBuildStructure(structure)) {
                this.buildStructure(structure);
            }
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
}

export default RoomStructures;
