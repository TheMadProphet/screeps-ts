import {buildRoadAtPositions, getPositionsAround} from "../helper";
import roomScanner from "../../../creep/roomScanner";
import {buildInfrastructureForSources} from "./sourceInfrastructure";

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
        room.memory.sources = roomScanner
            .scanSources(room, room.spawn)
            .sort((a, b) => Memory.sources[a].pathCost - Memory.sources[b].pathCost);
    }

    if (room.extensionsAreBuilt()) {
        if (room.controller.level === 3) {
            buildInfrastructureForSources(room.memory.sources, room.spawn);
        } else if (room.controller.level === 4) {
            const sources = _.flatten(room.getVisibleColonies().map(it => it.memory.sources));
            buildInfrastructureForSources(sources, room.spawn); // TODO: Storage
        }
    }
}

function buildControllerInfrastructure(room: Room) {
    if (!room.controller) return;

    if (!room.memory.hasRoadToController && room.controller.level >= 3 && room.extensionsAreBuilt()) {
        room.buildRoad(room.spawn.pos, room.controller.pos);
        room.memory.hasRoadToController = true;
    }
}

function buildSpawnInfrastructure(room: Room) {
    if (!room.controller) return;

    if (!room.memory.hasRoadAroundSpawn && room.controller.level >= 3 && room.extensionsAreBuilt()) {
        const positions = getPositionsAround(room.spawn.pos, 1);
        positions.push(...getPositionsAround(room.spawn.pos, 2));
        buildRoadAtPositions(room, positions);

        room.memory.hasRoadAroundSpawn = true;
    }
}

function establishColonies(room: Room) {
    if (room.memory.colonies) return;
    if (room.controller!.level < 2) return;
    if (!roomScanner.isNeighborsScanComplete(room)) return;

    const vacantRooms = room.memory.neighborsInfo!.vacantRooms;
    room.memory.colonies = vacantRooms
        .sort((a, b) => {
            const aCosts = Memory.rooms[a].sources.map(id => Memory.sources[id].pathCost);
            const bCosts = Memory.rooms[b].sources.map(id => Memory.sources[id].pathCost);
            return _.sum(aCosts) - _.sum(bCosts);
        })
        .slice(0, COLONY_LIMIT);
}

class RoomInfrastructure {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    build() {
        buildEnergyInfrastructure(this.room);
        buildControllerInfrastructure(this.room);
        buildSpawnInfrastructure(this.room);
        establishColonies(this.room);
    }
}

export default RoomInfrastructure;
