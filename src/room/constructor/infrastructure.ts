import {buildRoadAtPositions, getPositionsAround} from "./helper";

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

function buildRoadAroundSource(source: Source) {
    const room = source.room;
    const pos = source.pos;

    const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
    _.forEach(area, (y: number) => {
        _.forEach(area[y], (objects, x: any) => {
            for (const i in objects) {
                const object = objects[i];
                const position = room.getPositionAt(x, y);
                if (object.type === LOOK_TERRAIN && object.terrain !== "wall" && position) {
                    room.createConstructionSite(position, STRUCTURE_ROAD);
                }
            }
        });
    });
}

function buildRoadForSource(spawn: StructureSpawn, source: Source) {
    console.log("building road for", source.id);
    buildRoadAroundSource(source);
    source.room.buildBiDirectionalRoad(spawn.pos, source.pos);
    console.log("built road for", source.id);
}

function buildSourceInfrastructure(spawn: StructureSpawn, source: Source) {
    const roomMemory = spawn.room.memory;
    if (!roomMemory.sources[source.id]) roomMemory.sources[source.id] = {assignedWorkers: []};
    const sourceMemory = roomMemory.sources[source.id];

    if (!sourceMemory.hasRoad) {
        // buildRoadForSource(spawn, source);
        roomMemory.sources[source.id].hasRoad = true;
    }

    if (!sourceMemory.spaceAvailable) {
        roomMemory.sources[source.id].spaceAvailable = getSpaceAroundSource(source);
    }

    if (!sourceMemory.distanceToSpawn) {
        roomMemory.sources[source.id].distanceToSpawn = spawn.pos.findPathTo(source).length;
    }
}

function buildEnergyInfrastructure(room: Room) {
    if (_.size(room.memory.sources) !== _.size(room.rawSources)) {
        if (!room.memory.sources) {
            room.memory.sources = {};
        }

        let source;
        if (_.size(room.memory.sources) === 0) {
            source = room.spawn.pos.findClosestByPath(FIND_SOURCES, {
                filter: source => getSpaceAroundSource(source) > 0
            });
        } else if (_.size(room.memory.sources) === 1) {
            source = room.spawn.pos.findClosestByPath(FIND_SOURCES, {
                filter: source => source.id !== _.findLastKey(room.memory.sources) && getSpaceAroundSource(source) > 0
            });
        } else {
            _.forEach(room.memory.sources, (it, sourceId) => {
                const id = sourceId as Id<Source>;
                if (!it.hasRoad || !it.spaceAvailable || !it.distanceToSpawn) {
                    source = Game.getObjectById(id);
                }
            });
        }

        if (source) {
            buildSourceInfrastructure(room.spawn, source);
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

class RoomInfrastructure {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    build() {
        if (!this.room.controller) return;

        if (!this.room.constructionSites.length) {
            buildEnergyInfrastructure(this.room);
            buildControllerInfrastructure(this.room);
            buildSpawnInfrastructure(this.room);
        }
    }
}

export default RoomInfrastructure;
