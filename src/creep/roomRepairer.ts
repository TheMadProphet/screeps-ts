declare global {
    interface RoomMemory {
        structuresInMaintenance?: Id<AnyStructure>[];
    }
}

interface RoomCache {
    tick: number;
    structures: Id<AnyStructure>[];
}

// Structures will be repaired when their hits fall below the lower limit
// and will stop being repaired when they reach the upper limit
const LIMITS: Record<string, {upper: number; lower: number}> = {
    [STRUCTURE_WALL]: {upper: 0, lower: 0},
    [STRUCTURE_RAMPART]: {upper: 1, lower: 0.9},
    [STRUCTURE_ROAD]: {upper: 0.9, lower: 0.75},
    [STRUCTURE_CONTAINER]: {upper: 0.9, lower: 0.75},
    default: {upper: 1, lower: 0.9}
};

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

        return this.createRoomCache(room);
    }

    private createRoomCache(room: Room): RoomCache {
        const structures = room.find(FIND_STRUCTURES);
        const memory = Memory.rooms[room.name];

        const maintenanceSet = new Set<Id<AnyStructure>>(memory.structuresInMaintenance || []);
        this.updateStructureMaintenance(structures, maintenanceSet);
        memory.structuresInMaintenance = maintenanceSet.size > 0 ? Array.from(maintenanceSet) : undefined;

        const newCache: RoomCache = {
            tick: Game.time,
            structures: structures.filter(it => this.shouldRepair(it, maintenanceSet)).map(it => it.id)
        };
        this.cache[room.name] = newCache;
        return newCache;
    }

    private shouldRepair(structure: Structure, structuresInMaintenance: Set<Id<AnyStructure>>): boolean {
        if (structure.structureType === STRUCTURE_WALL) {
            return false;
        }

        const inMaintenance = structuresInMaintenance.has(structure.id as Id<AnyStructure>);

        if (structure.structureType === STRUCTURE_RAMPART) {
            const rcl = structure.room.controller?.level ?? 0;
            const targetHits = RAMPART_TARGETS[rcl] || 0;
            const limit = inMaintenance ? LIMITS[STRUCTURE_RAMPART].upper : LIMITS[STRUCTURE_RAMPART].lower;
            return structure.hits < targetHits * limit;
        }

        const limits = LIMITS[structure.structureType] || LIMITS.default;
        const limit = inMaintenance ? limits.upper : limits.lower;
        return structure.hits < structure.hitsMax * limit;
    }

    private updateStructureMaintenance(structures: AnyStructure[], maintenanceSet: Set<Id<AnyStructure>>): void {
        const existingIds = new Set(structures.map(s => s.id as Id<AnyStructure>));

        for (const id of maintenanceSet) {
            if (!existingIds.has(id)) {
                maintenanceSet.delete(id);
            }
        }

        // Update maintenance status for each structure
        for (const structure of structures) {
            if (structure.structureType === STRUCTURE_WALL) {
                continue;
            }

            const id: Id<AnyStructure> = structure.id;
            const inMaintenance = maintenanceSet.has(id);

            let hitsRatio: number;
            let limits: {upper: number; lower: number};
            let maxHits = structure.hitsMax;

            if (structure.structureType === STRUCTURE_RAMPART) {
                const rcl = structure.room.controller?.level ?? 0;
                maxHits = RAMPART_TARGETS[rcl] || 0;
            }

            hitsRatio = maxHits > 0 ? structure.hits / maxHits : 1;
            limits = LIMITS[structure.structureType] || LIMITS.default;

            if (inMaintenance && hitsRatio >= limits.upper) {
                // Exit maintenance: structure reached upper limit
                maintenanceSet.delete(id);
            } else if (!inMaintenance && hitsRatio < limits.lower) {
                // Enter maintenance: structure dropped below lower limit
                maintenanceSet.add(id);
            }
        }
    }
}

const roomRepairer = new RoomRepairer();
export default roomRepairer;
