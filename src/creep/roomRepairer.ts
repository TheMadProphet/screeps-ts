type RoomCache = {tick: number; structures: Id<AnyStructure>[]};

const CACHE_DURATION = 5;
const RAMPART_TARGETS: {[rclLevel: number]: number} = {
    0: 0,
    1: 0,
    2: 100000,
    3: 250000,
    4: 500000,
    5: 1000000,
    6: 2000000,
    7: 5000000,
    8: 10000000
};

class RoomRepairer {
    cache: {[roomName: string]: RoomCache} = {};

    public roomNeedsRepairs(room: Room) {
        const roomCache = this.getRoomCache(room);

        return roomCache.structures.length > 0;
    }

    public findStructureToRepair(creepOrTower: Creep | StructureTower): Structure | undefined {
        const roomCache = this.getRoomCache(creepOrTower.room);
        if (roomCache.structures.length === 0) {
            return undefined;
        }

        const structureIds = roomCache.structures;
        let closestStructure: Structure | null = null;
        let closestRange = Infinity;

        for (let i = structureIds.length - 1; i >= 0; i--) {
            const structure = Game.getObjectById(structureIds[i]);
            if (!structure) {
                structureIds.splice(i, 1);
                continue;
            }

            const range = creepOrTower.pos.getRangeTo(structure);
            if (range < closestRange) {
                closestRange = range;
                closestStructure = structure;
            }
        }

        return closestStructure || undefined;
    }

    private getRoomCache(room: Room): RoomCache {
        const roomCache = this.cache[room.name];
        if (roomCache && Game.time - roomCache.tick <= CACHE_DURATION) {
            return roomCache;
        }

        const newCache: RoomCache = {
            tick: Game.time,
            structures: room
                .find(FIND_STRUCTURES)
                .filter(this.structureNeedsRepair)
                .map(it => it.id)
        };
        this.cache[room.name] = newCache;
        return newCache;
    }

    public structureNeedsRepair(structure: Structure): boolean {
        if (structure.structureType === STRUCTURE_WALL) {
            return false;
        }

        if (structure.structureType === STRUCTURE_RAMPART) {
            const rcl = structure.room.controller?.level ?? 0;
            const targetHits = RAMPART_TARGETS[rcl] || 0;
            return structure.hits < targetHits * 0.8;
        }

        if (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_ROAD) {
            return structure.hits / structure.hitsMax < 0.8;
        }

        return structure.hits / structure.hitsMax < 0.9;
    }
}

const roomRepairer = new RoomRepairer();
export default roomRepairer;
