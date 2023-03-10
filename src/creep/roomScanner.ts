import {SCOUT} from "../constants";
import {Traveler} from "../utils/traveler/traveler";

declare global {
    interface RoomMemory {
        neighborsInfo?: {
            roomNames: string[];
            scannedRooms: Record<string, RoomScanInfo>;
            vacantRooms: string[];
            scanComplete?: boolean;
        };
    }

    interface CreepMemory {
        assignedRoom?: string | null;
    }
}

interface RoomScanInfo {
    name: string;
    isVacant: boolean;
    sources: Id<Source>[];
}

export function getSpaceAroundSource(source: Source) {
    const room = source.room;
    const pos = source.pos;

    let space = 0;
    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];
                if (object.type === LOOK_TERRAIN && object.terrain !== "wall") {
                    space++;
                }
            }
        }
    }

    return space;
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
    roomsAreVisible(room: Room): boolean {
        return Boolean(room.memory.neighborsInfo?.scanComplete && this.getUnscoutedRoomAround(room) === null);
    },

    needsMoreScouts(room: Room) {
        return (
            !room.memory.neighborsInfo ||
            room.spawn.creepsByRole[SCOUT].length < room.memory.neighborsInfo.roomNames.length
        );
    },

    getUnscoutedRoomAround(room: Room): string | null {
        if (!room.memory.neighborsInfo) {
            room.memory.neighborsInfo = {
                roomNames: _.map(Game.map.describeExits(room.name), value => value),
                scannedRooms: {},
                vacantRooms: []
            };
        }

        const scoutedNeighbors = room.spawn.creepsByRole[SCOUT].map(it => it.memory.assignedRoom);

        let roomsToScout = room.memory.neighborsInfo.vacantRooms;
        if (!room.memory.neighborsInfo.scanComplete) roomsToScout = room.memory.neighborsInfo.roomNames;

        for (const i in roomsToScout) {
            const roomName = roomsToScout[i];
            if (!scoutedNeighbors.includes(roomName)) {
                return roomName;
            }
        }

        return null;
    },

    scanRoom(roomToScan: Room, home: Room) {
        const neighbors = home.memory.neighborsInfo!;
        if (neighbors.scannedRooms[roomToScan.name]) return;

        const cpuStart = Game.cpu.getUsed();
        const roomInfo: RoomScanInfo = {
            name: roomToScan.name,
            isVacant: isVacant(roomToScan),
            sources: this.scanSources(roomToScan, home.spawn)
        };
        const usedCpu = Game.cpu.getUsed() - cpuStart;
        console.log(`Scanned ${roomToScan.name}[${roomInfo.sources.length}], CPU used: `, usedCpu);

        neighbors.scannedRooms[roomToScan.name] = roomInfo;

        if (_.size(neighbors.roomNames) === _.size(neighbors.scannedRooms)) {
            neighbors.scanComplete = true;
            neighbors.vacantRooms = Object.values(neighbors.scannedRooms)
                .filter(room => room.isVacant)
                .map(room => room.name);
            console.log(`${home.name} Neighbors Scan Finished`);
            console.log(`Vacant rooms: [${neighbors.vacantRooms.length}/${neighbors.roomNames.length}]`);
        }
    },

    scanSources(room: Room, spawn: StructureSpawn) {
        const sources = room.find(FIND_SOURCES).filter(it => getSpaceAroundSource(it) > 0);

        sources.forEach(it => {
            it.memory.pathCost = Traveler.findTravelPath(spawn.pos, it.pos).cost;
        });

        return sources.map(it => it.id);
    }
};

export default roomScanner;
