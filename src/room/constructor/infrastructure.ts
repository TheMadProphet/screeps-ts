import {buildRoadAtPositions, getPositionsAround} from "./helper";
import roomScanner, {getAvailablePositionsAround} from "../../creep/roomScanner";

declare global {
    interface RoomMemory {
        colonies?: string[];
    }
}

const COLONY_LIMIT = 2;

function findContainerNearSource(source: Source): Id<StructureContainer> | undefined {
    const findResult = source.room
        .lookForAtArea(LOOK_STRUCTURES, source.pos.y + 1, source.pos.x - 1, source.pos.y - 1, source.pos.x + 1, true)
        .find(it => it.structure.structureType === STRUCTURE_CONTAINER);

    if (!findResult) return undefined;

    return findResult.structure.id as Id<StructureContainer>;
}

function buildContainerForSource(source: Source) {
    if (source.memory.containerId) return;

    if (source.memory.containerConstructionStarted) {
        const containerId = findContainerNearSource(source);
        if (containerId) {
            source.memory.containerId = containerId;
            delete source.memory.containerConstructionStarted;
            return;
        }
    } else {
        const pos = getAvailablePositionsAround(source)[0];
        if (!pos) return;

        const constructionStatus = source.room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
        if (constructionStatus === OK) {
            source.memory.containerConstructionStarted = true;
        }
    }
}

function buildContainersForSources(sourceIds: Id<Source>[]) {
    sourceIds
        .map(it => Game.getObjectById(it))
        .filter((it): it is Source => Boolean(it))
        .forEach(source => buildContainerForSource(source));
}

function buildEnergyInfrastructure(room: Room) {
    if (!room.controller) return;

    if (!room.memory.sources) {
        room.memory.sources = roomScanner
            .scanSources(room, room.spawn)
            .sort((a, b) => Memory.sources[a].pathCost - Memory.sources[b].pathCost);
    }

    if (room.controller.level === 3) {
        if (room.availableExtension === 0) {
            buildContainersForSources(room.memory.sources);
            // buildRoadsForSources(room.memory.sources);
        }
    }
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
