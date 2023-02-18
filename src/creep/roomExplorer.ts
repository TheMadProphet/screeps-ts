import {getSpaceAroundSource} from "../room/constructor/infrastructure";
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
            room.memory.neighborRooms = {}
        } else if (_.size(neighborRooms) === _.size(room.memory.neighborRooms)) {
            room.memory.neighborsScanned = true;
            console.log(`${room.name} Neighbors Scan Finished: `, room.memory.neighborRooms);
            return;
        }

        const scout = room.spawn.creepsByRole[SCOUT][0];
        if (scout) {
            if (scout.memory.assignedRoom == null) {
                for (const i in neighborRooms) {
                    const neighbor = neighborRooms[i];
                    console.log(neighbor);
                    if (!room.memory.neighborRooms[neighbor]) {
                        scout.memory.assignedRoom = neighbor;
                        return;
                    }
                }
                scout.suicide();
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
            sources: roomToScan
                .find(FIND_SOURCES)
                .map(it => {
                    return {
                        id: it.id,
                        spaceAvailable: getSpaceAroundSource(it),
                        pathFromSpawn: home.spawn.pos.findPathTo(it, {maxOps: 100, maxRooms: 2}),
                        pathToSpawn: it.pos.findPathTo(home.spawn, {maxOps: 100, maxRooms: 2})
                    } as SourceMemory;
                })
                .filter(it => it.spaceAvailable > 0)
        };

        home.memory.neighborRooms[roomToScan.name] = roomInfo;

        const usedCpu = Game.cpu.getUsed() - cpuStart;
        console.log(`Scanned ${roomToScan.name}[${roomInfo.sources.length}], CPU used: `, usedCpu);
    }
};

export default roomExplorer;
