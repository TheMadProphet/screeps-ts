import {SCOUT} from "../constants";

declare global {
    interface RoomMemory {
        neighborRooms: Record<string, RoomScanInfo>;
        neighborsScanned?: boolean;
    }

    interface CreepMemory {
        assignedRoom?: string | null;
    }
}

interface RoomScanInfo {
    room: string;
    vacant: boolean;
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

const roomExplorer = {
    exploreAround(room: Room) {
        if (room.memory.neighborsScanned) return;

        const neighborRooms = _.map(Game.map.describeExits(room.name), value => value);
        if (!room.memory.neighborRooms) {
            room.memory.neighborRooms = {};
        } else if (_.size(neighborRooms) === _.size(room.memory.neighborRooms)) {
            room.memory.neighborsScanned = true;
            room.spawn.creepsByRole[SCOUT].forEach(scout => scout.suicide());
            console.log(`${room.name} Neighbors Scan Finished: `, room.memory.neighborRooms);
            return;
        }

        const scout = room.spawn.creepsByRole[SCOUT][0];
        if (scout) {
            if (scout.memory.assignedRoom == null) {
                for (const i in neighborRooms) {
                    const neighbor = neighborRooms[i];
                    if (!room.memory.neighborRooms[neighbor]) {
                        scout.memory.assignedRoom = neighbor;
                        return;
                    }
                }
            }
        }
    },

    needsScout(room: Room) {
        if (room.memory.neighborsScanned) return false;

        return room.spawn.creepsByRole[SCOUT].length < 1;
    },

    scan(roomToScan: Room, home: Room) {
        const cpuStart = Game.cpu.getUsed();

        const roomInfo: RoomScanInfo = {
            room: roomToScan.name,
            vacant: isVacant(roomToScan),
            sources: this.scanSources(roomToScan, home.spawn)
        };

        home.memory.neighborRooms[roomToScan.name] = roomInfo;

        const usedCpu = Game.cpu.getUsed() - cpuStart;
        console.log(`Scanned ${roomToScan.name}[${roomInfo.sources.length}], CPU used: `, usedCpu);
    },

    scanSources(room: Room, spawn: StructureSpawn) {
        return room
            .find(FIND_SOURCES)
            .filter(it => getSpaceAroundSource(it) > 0)
            .map(it => {
                const pathFromSpawn = spawn.pos.findPathTo(it, {maxOps: 100, maxRooms: 2});
                const sourceMemory: SourceMemory = {
                    id: it.id,
                    spaceAvailable: getSpaceAroundSource(it),
                    pathFromSpawn: pathFromSpawn,
                    pathToSpawn: pathFromSpawn.reverse(),
                    assignedMiners: []
                };
                return sourceMemory;
            });
    }
};

export default roomExplorer;
