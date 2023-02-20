import {SCOUT} from "../constants";

declare global {
    interface RoomMemory {
        neighbors?: {
            roomNames: string[];
            scannedRooms: Record<string, RoomScanInfo>;
            vacantRooms: string[];
            scanned?: boolean;
        };
    }

    interface CreepMemory {
        assignedRoom?: string | null;
    }
}

interface RoomScanInfo {
    name: string;
    isVacant: boolean;
    sources: SourceMemory[];
}

function getSpaceAroundSource(source: Source) {
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
    finishedScanningAround(room: Room) {
        return Boolean(room.memory.neighbors?.scanned);
    },

    needsMoreScouts(room: Room) {
        return !room.memory.neighbors || room.spawn.creepsByRole[SCOUT].length < room.memory.neighbors.roomNames.length;
    },

    getUnscoutedRoomAround(room: Room) {
        if (!room.memory.neighbors) {
            room.memory.neighbors = {
                roomNames: _.map(Game.map.describeExits(room.name), value => value),
                scannedRooms: {},
                vacantRooms: []
            };
        }

        const scoutedNeighbors = room.spawn.creepsByRole[SCOUT].map(it => it.memory.assignedRoom);

        let roomsToScout = room.memory.neighbors.vacantRooms;
        if (!room.memory.neighbors.scanned) roomsToScout = room.memory.neighbors.roomNames;

        for (const i in roomsToScout) {
            const roomName = roomsToScout[i];
            if (!scoutedNeighbors.includes(roomName)) {
                return roomName;
            }
        }

        return null;
    },

    scanRoom(roomToScan: Room, home: Room) {
        const neighbors = home.memory.neighbors!;
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
            neighbors.scanned = true;
            neighbors.vacantRooms = Object.values(neighbors.scannedRooms)
                .filter(room => room.isVacant)
                .map(room => room.name);
            console.log(`${home.name} Neighbors Scan Finished`);
            console.log(`Vacant rooms: [${neighbors.vacantRooms.length}/${neighbors.roomNames.length}]`);
        }
    },

    scanSources(room: Room, spawn: StructureSpawn) {
        return room
            .find(FIND_SOURCES)
            .filter(it => getSpaceAroundSource(it) > 0)
            .map(it => {
                let pathFromSpawn: PathStep[] | RoomPosition[] = PathFinder.search(spawn.pos, it.pos).path;
                if (it.room.name !== room.name) {
                    pathFromSpawn = PathFinder.search(spawn.pos, it.pos).path;
                }

                const sourceMemory: SourceMemory = {
                    id: it.id,
                    roomName: room.name,
                    spaceAvailable: getSpaceAroundSource(it),
                    pathFromSpawn: pathFromSpawn,
                    pathToSpawn: [...pathFromSpawn].reverse(),
                    assignedMiners: []
                };

                return sourceMemory;
            });
    },

    generateNewPathToSpawn(sourceMemory: SourceMemory, home: Room) {
        const it = Game.getObjectById(sourceMemory.id)!;
        const pathFromSpawn: RoomPosition[] = PathFinder.search(home.spawn.pos, it.pos).path;

        sourceMemory.pathFromSpawn = pathFromSpawn;
        sourceMemory.pathToSpawn = [...pathFromSpawn].reverse();
    }
};

export default roomScanner;
