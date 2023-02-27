import {buildRoadAtPositions, getPositionsAround} from "./helper";
import roomScanner from "../../creep/roomScanner";

function buildEnergyInfrastructure(room: Room) {
    if (room.memory.sources || !room.spawn) return;

    room.memory.sources = roomScanner
        .scanSources(room, room.spawn)
        .sort((a, b) => a.distanceToSpawn - b.distanceToSpawn)
        .reduce((acc, sourceMemory) => {
            return {...acc, [sourceMemory.id]: sourceMemory};
        }, {} as Record<Id<Source>, SourceMemory>);
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

function setupRemoteMines(room: Room) {
    if (room.memory.remoteSources) return;
    if (room.controller!.level < 2) return;
    if (!roomScanner.finishedScanningAround(room)) return;

    const neighbors = Object.values(room.memory.neighbors!.scannedRooms)
        .filter(it => it.isVacant)
        .sort((a, b) => {
            return _.sum(b.sources, it => it.distanceToSpawn) - _.sum(a.sources, it => it.distanceToSpawn);
        });

    room.memory.remoteSources = {};
    _.forEach(neighbors, neighbor => {
        room.memory.remoteSources![neighbor.name] = neighbor.sources.reduce((acc, sourceMemory) => {
            return {...acc, [sourceMemory.id]: sourceMemory};
        }, {} as Record<Id<Source>, SourceMemory>);
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
        setupRemoteMines(this.room);
    }
}

export default RoomInfrastructure;
