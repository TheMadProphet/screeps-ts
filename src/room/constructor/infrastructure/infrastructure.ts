import roomScanner from "../../../creep/roomScanner";
import {buildInfrastructureForSources, rebuildSourceInfrastructure} from "./sourceInfrastructure";
import roomGrid from "../../grid/roomGrid";
import {buildInfrastructureForMineral, rebuildMineralInfrastructure} from "./mineralInfrastructure";

declare global {
    interface RoomMemory {
        colonies?: string[];
        hasRoadAroundSpawn?: boolean;
        hasRoadToController?: boolean;
    }
}

const COLONY_LIMIT = 2;

function buildEnergyInfrastructure(room: Room) {
    if (!room.controller) return;

    if (!room.memory.sources) {
        roomScanner.scanSources(room, room.spawn);
    }

    if (room.extensionsAreBuilt()) {
        if (room.controller.level === 3) {
            buildInfrastructureForSources(room.memory.sources, room.spawn);
        } else if (room.controller.level === 4) {
            const sources = _.flatten(room.getVisibleColonies().map(it => it.memory.sources));
            buildInfrastructureForSources(sources, room.storage ?? room.spawn);
        } else if (room.controller.level >= 5 && room.storage && Game.time % 25 === 0) {
            const remoteSources = _.flatten(room.getVisibleColonies().map(it => it.memory.sources));
            rebuildSourceInfrastructure([...room.memory.sources, ...remoteSources], room.storage);
        }
    }
}

function buildMineralInfrastructure(room: Room) {
    if (!room.controller) return;

    if (!room.memory.mineral) {
        roomScanner.scanMineral(room);
    }

    if (room.memory.mineral && room.extensionsAreBuilt() && room.controller.level === 6) {
        buildInfrastructureForMineral(room.memory.mineral);

        if (Game.time % 25 === 0) {
            rebuildMineralInfrastructure(room.memory.mineral);
        }
    }
}

function buildRoadToController(room: Room) {
    if (!room.controller) return;

    if (!room.memory.hasRoadToController && room.controller.level >= 3 && room.extensionsAreBuilt()) {
        room.buildRoad(room.spawn.pos, room.controller.pos);
        room.memory.hasRoadToController = true;
    }
}

class RoomInfrastructure {
    room: Room;
    controller: StructureController;

    constructor(room: Room, controller: StructureController) {
        this.room = room;
        this.controller = controller;
    }

    build() {
        buildEnergyInfrastructure(this.room);
        buildMineralInfrastructure(this.room);
        buildRoadToController(this.room);
        this.buildRoadAroundCells();
    }

    private buildRoadAroundCells() {
        if (this.controller.level >= 3 && Game.time % 100 === 0) {
            for (let i = 0; i < this.room.memory.gridExtensionCellIndex; i++) {
                roomGrid
                    .getCell(this.room, i)
                    .getPositionsAround()
                    .filter(it => this.room.lookForAt(LOOK_TERRAIN, it.x, it.y).every(t => t !== "wall"))
                    .forEach(it => this.room.createConstructionSite(it.x, it.y, STRUCTURE_ROAD));
            }
        }
    }
}

export default RoomInfrastructure;
