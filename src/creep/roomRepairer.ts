declare global {
    interface RoomMemory {
        inMaintenanceMode?: boolean;
        inMaintenanceSince?: number;
        maintenanceTriggeredBy?: string;
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
        this.updateMaintenanceMode(room, structures);
        const inMaintenanceMode = Memory.rooms[room.name].inMaintenanceMode;
        const newCache: RoomCache = {
            tick: Game.time,
            structures: structures.filter(it => this.shouldRepair(it, inMaintenanceMode)).map(it => it.id)
        };
        this.cache[room.name] = newCache;
        return newCache;
    }

    private shouldRepair(structure: Structure, toUpperLimit?: boolean): boolean {
        if (structure.structureType === STRUCTURE_WALL) {
            return false;
        }

        if (structure.structureType === STRUCTURE_RAMPART) {
            const rcl = structure.room.controller?.level ?? 0;
            const targetHits = RAMPART_TARGETS[rcl] || 0;
            const limit = toUpperLimit ? LIMITS[STRUCTURE_RAMPART].upper : LIMITS[STRUCTURE_RAMPART].lower;
            return structure.hits < targetHits * limit;
        }

        const limits = LIMITS[structure.structureType] || LIMITS.default;
        const limit = toUpperLimit ? limits.upper : limits.lower;
        return structure.hits < structure.hitsMax * limit;
    }

    private updateMaintenanceMode(room: Room, structures: AnyStructure[]) {
        const memory = Memory.rooms[room.name];

        if (memory.inMaintenanceMode) {
            // Check if we can exit maintenance mode
            const structuresNeedingRepair = structures.filter(it => this.shouldRepair(it, true));
            if (structuresNeedingRepair.length === 0) {
                memory.inMaintenanceMode = false;
                memory.inMaintenanceSince = undefined;
                memory.maintenanceTriggeredBy = undefined;
            }
        } else {
            // Check if we should enter maintenance mode
            const structuresNeedingRepair = structures.filter(it => this.shouldRepair(it, false));
            if (structuresNeedingRepair.length > 0) {
                memory.inMaintenanceMode = true;
                memory.inMaintenanceSince = Game.time;
                memory.maintenanceTriggeredBy = structuresNeedingRepair[0].structureType;
            }
        }
    }
}

const roomRepairer = new RoomRepairer();
export default roomRepairer;
