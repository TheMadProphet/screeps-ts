import {buildRoadAtPositions, getPositionsAround} from "./helper";

function positionIsNotOccupied(pos: RoomPosition, room: Room) {
    const lookObjects = room.lookAt(pos);
    for (const i in lookObjects) {
        const lookObject = lookObjects[i];
        if (lookObject.type === LOOK_STRUCTURES || lookObject.type === LOOK_CONSTRUCTION_SITES) {
            return false;
        }
    }

    return true;
}

function energySourceIsNotNear(pos: RoomPosition, room: Room) {
    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    for (const y in area) {
        for (const x in area[y]) {
            const objects = area[y][x];
            for (const i in objects) {
                const object = objects[i];

                if (object.type === LOOK_SOURCES) {
                    return false;
                }
            }
        }
    }

    return true;
}

function canBuildExtensionAt(pos: RoomPosition, room: Room) {
    return positionIsNotOccupied(pos, room) && energySourceIsNotNear(pos, room);
}

function buildExtensions(room: Room) {
    if (!room.memory.ringsize) room.memory.ringsize = 3;

    const positions = getPositionsAround(room.spawn.pos, room.memory.ringsize);
    let constructionStarted = false;
    for (const i in positions) {
        const pos = room.getPositionAt(positions[i].x, positions[i].y);
        if (pos && canBuildExtensionAt(pos, room)) {
            const constructionStatus = room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION);

            if (constructionStatus === OK) {
                constructionStarted = true;
                break;
            }
        }
    }

    if (!constructionStarted) {
        buildRoadAtPositions(room, getPositionsAround(room.spawn.pos, room.memory.ringsize + 1));
        room.memory.ringsize += 2;
    }
}

class RoomStructures {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    build() {
        if (!this.room.controller) return;

        if (!this.room.constructionSites.length) {
            if (this.room.availableExtension > 0) {
                buildExtensions(this.room);
            }
        }
    }
}

export default RoomStructures;
