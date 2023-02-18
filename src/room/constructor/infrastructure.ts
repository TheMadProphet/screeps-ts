import {buildRoadAtPositions, getPositionsAround} from "./helper";
import roomExplorer from "../../creep/roomExplorer";

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

function buildEnergyInfrastructure(room: Room) {
    if (room.memory.sources || !room.spawn) return;

    room.memory.sources = roomExplorer
        .scanSources(room, room.spawn)
        .sort((a, b) => a.pathFromSpawn.length - b.pathFromSpawn.length)
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

class RoomInfrastructure {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    build() {
        buildEnergyInfrastructure(this.room);
        buildControllerInfrastructure(this.room);
        buildSpawnInfrastructure(this.room);
    }
}

export default RoomInfrastructure;
