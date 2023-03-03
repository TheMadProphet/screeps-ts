import {buildRoadAtPositions, getPositionsAround} from "./helper";
import roomScanner from "../../creep/roomScanner";

declare global {
    interface RoomMemory {
        colonies?: string[];
    }
}

const COLONY_LIMIT = 2;

function buildEnergyInfrastructure(room: Room) {
    if (room.memory.sources) return;

    room.memory.sources = roomScanner
        .scanSources(room, room.spawn)
        .sort((a, b) => Memory.sources[a].pathCost - Memory.sources[b].pathCost);
}

function buildControllerInfrastructure(room: Room) {
    if (!room.memory.hasRoadToController && room.controller!.level >= 3) {
        room.buildRoad(room.spawn.pos, room.controller!.pos);
        room.memory.hasRoadToController = true;
    }
}

function buildSpawnInfrastructure(room: Room) {
    if (!room.memory.hasRoadAroundSpawn && room.controller!.level >= 3) {
        const positions = getPositionsAround(room.spawn.pos, 1);
        positions.push(...getPositionsAround(room.spawn.pos, 2));
        buildRoadAtPositions(room, positions);

        room.memory.hasRoadAroundSpawn = true;
    }
}

function establishColonies(room: Room) {
    if (room.memory.colonies) return;
    if (room.controller!.level < 2) return;
    if (!roomScanner.roomsAreVisible(room)) return;

    const colonies = Object.values(room.memory.neighborsInfo!.scannedRooms)
        .filter(it => it.isVacant)
        .sort((a, b) => {
            const bCosts = b.sources.map(id => Memory.sources[id].pathCost);
            const aCosts = a.sources.map(id => Memory.sources[id].pathCost);
            return _.sum(bCosts) - _.sum(aCosts);
        })
        .slice(0, COLONY_LIMIT);

    room.memory.colonies = colonies.map(it => it.name);

    _.forEach(colonies, colonyInfo => {
        const room = Game.rooms[colonyInfo.name];
        room.memory.sources = room.find(FIND_SOURCES).map(it => it.id);
    });
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
