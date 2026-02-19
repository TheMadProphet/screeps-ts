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
    [STRUCTURE_WALL]: {upper: 1, lower: 0.9},
    [STRUCTURE_RAMPART]: {upper: 1, lower: 0.9},
    [STRUCTURE_ROAD]: {upper: 0.9, lower: 0.75},
    [STRUCTURE_CONTAINER]: {upper: 0.9, lower: 0.75},
    default: {upper: 1, lower: 0.9}
};

const CACHE_DURATION = 5;
const RAMPART_TARGETS: {[rclLevel: number]: number} = {
    0: 0,
    1: 0,
    2: 50000,
    3: 150000,
    4: 250000,
    5: 500000,
    6: 2000000,
    7: 5000000,
    8: 10000000
};

const WALL_TARGETS: {[rclLevel: number]: number} = Object.entries(RAMPART_TARGETS).reduce((acc, [rcl, hits]) => {
    acc[Number(rcl)] = hits * 2;
    return acc;
}, {} as {[rclLevel: number]: number});

const STRUCTURES_TO_DEFEND_FROM_NUKES: StructureConstant[] = [STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TERMINAL];

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
        const nukes = room.find(FIND_NUKES);
        this.updateStructureMaintenance(structures, maintenanceSet, nukes);
        memory.structuresInMaintenance = maintenanceSet.size > 0 ? Array.from(maintenanceSet) : undefined;

        const newCache: RoomCache = {
            tick: Game.time,
            structures: structures.filter(it => this.shouldRepair(it, maintenanceSet, nukes)).map(it => it.id)
        };
        this.cache[room.name] = newCache;
        return newCache;
    }

    private shouldRepair(structure: Structure, structuresInMaintenance: Set<Id<AnyStructure>>, nukes: Nuke[]): boolean {
        const inMaintenance = structuresInMaintenance.has(structure.id as Id<AnyStructure>);

        if (structure.structureType === STRUCTURE_RAMPART) {
            const rcl = structure.room.controller?.level ?? 0;
            let targetHits = RAMPART_TARGETS[rcl] || 0;
            if (rcl >= 6 && nukes.length > 0) {
                const hitsForNuke = this.getRampartHitpointsAgainstNukes(structure as StructureRampart, nukes);
                targetHits = Math.max(targetHits, hitsForNuke);
            }
            const limit = inMaintenance ? LIMITS[STRUCTURE_RAMPART].upper : LIMITS[STRUCTURE_RAMPART].lower;
            return structure.hits < targetHits * limit;
        } else if (structure.structureType === STRUCTURE_WALL) {
            const rcl = structure.room.controller?.level ?? 0;
            const targetHits = WALL_TARGETS[rcl] || 0;
            const limit = inMaintenance ? LIMITS[STRUCTURE_WALL].upper : LIMITS[STRUCTURE_WALL].lower;
            return structure.hits < targetHits * limit;
        }

        const limits = LIMITS[structure.structureType] || LIMITS.default;
        const limit = inMaintenance ? limits.upper : limits.lower;
        return structure.hits < structure.hitsMax * limit;
    }

    private updateStructureMaintenance(
        structures: AnyStructure[],
        maintenanceSet: Set<Id<AnyStructure>>,
        nukes: Nuke[]
    ): void {
        const existingIds = new Set(structures.map(s => s.id as Id<AnyStructure>));

        for (const id of maintenanceSet) {
            if (!existingIds.has(id)) {
                maintenanceSet.delete(id);
            }
        }

        // Update maintenance status for each structure
        for (const structure of structures) {
            const id: Id<AnyStructure> = structure.id;
            const inMaintenance = maintenanceSet.has(id);

            let hitsRatio: number;
            let limits: {upper: number; lower: number};
            let maxHits = structure.hitsMax;

            if (structure.structureType === STRUCTURE_RAMPART) {
                const rcl = structure.room.controller?.level ?? 0;
                maxHits = RAMPART_TARGETS[rcl] || 0;

                if (rcl >= 6 && nukes.length > 0) {
                    const hitsForNuke = this.getRampartHitpointsAgainstNukes(structure as StructureRampart, nukes);
                    maxHits = Math.max(maxHits, hitsForNuke);
                }
            } else if (structure.structureType === STRUCTURE_WALL) {
                const rcl = structure.room.controller?.level ?? 0;
                maxHits = WALL_TARGETS[rcl] || 0;
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

    private getRampartHitpointsAgainstNukes(rampart: StructureRampart, nukes: Nuke[]): number {
        const structures = rampart.pos.lookFor(LOOK_STRUCTURES);
        if (!structures.some(s => STRUCTURES_TO_DEFEND_FROM_NUKES.includes(s.structureType))) {
            return -1;
        }

        let maxHits = 0;
        for (const nuke of nukes) {
            const distance = rampart.pos.getRangeTo(nuke);
            if (distance === 0) {
                maxHits += 10000000;
            } else if (distance <= 5) {
                maxHits += 5000000;
            }
        }

        return maxHits > 0 ? maxHits * 1.2 : -1;
    }
}

const roomRepairer = new RoomRepairer();
export default roomRepairer;
