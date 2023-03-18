import {CreepRole} from "../constants";

declare global {
    interface Memory {
        stats: Stats;
    }

    interface Stats {
        userStats: UserStatistics;
        rooms: RoomStatistics;
        creeps: CreepStatistics;
    }

    interface UserStatistics {
        time: number;
        usedCpu: UsedCpuStatistics;
        bucket: number;
        maxCpu: number;
        memory: number;
        gcl: number;
    }

    interface UsedCpuStatistics {
        total: number;
        intents: number;
        pathfinding: number;
        stats?: number;
    }

    interface RoomStatistics {
        rcl: number;
        rclProgress: number;
        rclProgressTotal: number;
        spawnEnergy: number;
        spawnEnergyMax: number;
        spawning: boolean;
        storageEnergy: number;
        containerEnergy: number;
        towerEnergy: number;
        hostileCreeps: number;
        creepStats: CreepStatistics;
    }

    interface CreepStatistics {
        totalCreeps: number;
        creepsByRole: Partial<Record<CreepRole, number>>;
    }
}

export class Statistics {
    private static creepIntentRegistry = new Set();

    public static onTickStart() {
        if (!Memory.stats) {
            Memory.stats = {rooms: {}, creeps: {}, userStats: {usedCpu: {}}} as Stats;
        }

        Memory.stats.userStats.usedCpu.intents = 0;
        Memory.stats.userStats.usedCpu.pathfinding = 0;
        Statistics.creepIntentRegistry = new Set();
    }

    public static exportAll() {
        const cpuStart = Game.cpu.getUsed();

        _.forEach(Game.rooms, room => this.exportRoomStatistics(room));
        this.exportCreepStatistics();
        this.exportUserStatistics();

        Memory.stats.userStats.usedCpu.stats = Game.cpu.getUsed() - cpuStart;
    }

    private static exportRoomStatistics(room: Room) {
        if (!room.controller || !room.controller.my) return;

        const containers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        }) as StructureContainer[];
        const containerEnergy = _.sum(containers, c => c.store.energy);

        const towers = room.find(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_TOWER
        }) as StructureTower[];
        const towerEnergy = _.sum(towers, t => t.store.energy);

        Memory.stats.rooms = {
            rcl: room.controller?.level,
            rclProgress: room.controller.progress,
            rclProgressTotal: room.controller.progressTotal,
            spawnEnergy: room.energyAvailable,
            spawnEnergyMax: room.energyCapacityAvailable,
            spawning: !!room.spawn.spawning,
            storageEnergy: room.storage?.store?.energy || 0,
            containerEnergy,
            towerEnergy,
            hostileCreeps: room.find(FIND_HOSTILE_CREEPS).length,
            creepStats: this.generateCreepStatistics(room.find(FIND_MY_CREEPS))
        };
    }

    private static exportCreepStatistics() {
        Memory.stats.creeps = this.generateCreepStatistics(Game.creeps);
    }

    private static generateCreepStatistics(creeps: Creep[] | typeof Game.creeps): CreepStatistics {
        return {
            totalCreeps: _.size(creeps),
            creepsByRole: _.countBy(creeps, c => c.memory.role)
        };
    }

    private static exportUserStatistics() {
        Memory.stats.userStats = {
            bucket: Game.cpu.bucket,
            maxCpu: Game.cpu.limit,
            memory: RawMemory.get().length,
            gcl: Game.gcl.level,
            time: Game.time,
            usedCpu: {...Memory.stats.userStats.usedCpu, total: Game.cpu.getUsed()}
        };
    }

    public static registerCreepIntent(creepName: string) {
        if (Statistics.creepIntentRegistry.has(creepName)) return;

        Memory.stats.userStats.usedCpu.intents += 0.2;
        Statistics.creepIntentRegistry.add(creepName);
    }

    public static registerPathfindingCpuUsage(cpuUsage: number) {
        Memory.stats.userStats.usedCpu.pathfinding += cpuUsage;
    }
}
