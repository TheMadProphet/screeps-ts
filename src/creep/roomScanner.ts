import {SCOUT} from "../constants";
import {Traveler} from "../utils/traveler/traveler";

declare global {
    interface RoomMemory {
        neighborsInfo?: {
            roomNames: string[];
            scannedRooms: string[];
            vacantRooms: string[];
            scanComplete?: boolean;
        };
    }
}

export function getAvailablePositionsAround(source: Source) {
    const room = source.room;
    const pos = source.pos;

    let availablePositions: {x: number; y: number}[] = [];
    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];
                if (object.type === LOOK_TERRAIN && object.terrain !== "wall") {
                    availablePositions.push({x: parseInt(x), y: parseInt(y)});
                }
            }
        }
    }

    return availablePositions;
}

function isVacant(room: Room) {
    if (room.controller?.my) return true;

    if (room.controller) {
        if (room.controller.owner?.username) return false;
        if (room.controller.reservation?.username) return false;
    }

    return room.find(FIND_HOSTILE_CREEPS).length == 0;
}

const roomScanner = {
    isNeighborsScanComplete(room: Room): boolean {
        return Boolean(room.memory.neighborsInfo?.scanComplete);
    },

    needsScoutToScanNeighbors(room: Room) {
        if (room.memory.neighborsInfo?.scanComplete) {
            return false;
        }

        return room.creepsByRole[SCOUT].length < 1;
    },

    getUnscoutedNeighborFor(room: Room): string | null {
        if (!room.memory.neighborsInfo) {
            room.memory.neighborsInfo = {
                roomNames: _.map(Game.map.describeExits(room.name), value => value),
                scannedRooms: [],
                vacantRooms: []
            };
        }

        const roomsToScout = room.memory.neighborsInfo.roomNames;
        for (const roomToScout of roomsToScout) {
            if (!room.memory.neighborsInfo.scannedRooms.includes(roomToScout)) {
                return roomToScout;
            }
        }

        return null;
    },

    scanRoom(roomToScan: Room, home: Room) {
        const neighbors = home.memory.neighborsInfo!;
        if (neighbors.scannedRooms.includes(roomToScan.name)) return;

        roomToScan.memory.sources = this.scanSources(roomToScan, home.spawn);
        neighbors.scannedRooms.push(roomToScan.name);
        if (isVacant(roomToScan)) {
            neighbors.vacantRooms.push(roomToScan.name);
        }

        if (neighbors.roomNames.length === neighbors.scannedRooms.length) {
            neighbors.scanComplete = true;
        }
    },

    scanSources(room: Room, spawn: StructureSpawn) {
        const sources = room.find(FIND_SOURCES).filter(it => getAvailablePositionsAround(it).length > 0);

        sources.forEach(it => {
            it.memory.pathCost = Traveler.findTravelPath(spawn.pos, it.pos).cost;
        });

        return sources.map(it => it.id);
    }
};

export default roomScanner;
