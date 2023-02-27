import {CreepRole} from "../constants";

declare global {
    interface Memory {
        stats: Stats;
    }

    interface Stats {
        userStats: UserStatistics;
        roomStats: RoomStatistics;
        creepStats: CreepStatistics;
    }

    interface UserStatistics {
        time: number;
        cpu: number;
        cpuForIntents?: number;
        cpuForPathfinding?: number;
        cpuForStats?: number;
        bucket: number;
        memory: number;
        gcl: number;
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
    private static lastCreepIntentTick = 0;
    private static creepIntentRegistry = new Set();
    private static lastPathfindingUsageTick = 0;

    public static exportAll() {
        const cpuStart = Game.cpu.getUsed();

        if (!Memory.stats) {
            Memory.stats = {roomStats: {}, creepStats: {}, userStats: {}} as Stats;
        }

        _.forEach(Game.rooms, room => this.exportRoomStatistics(room));
        this.exportCreepStatistics();
        this.exportUserStatistics();

        Memory.stats.userStats.cpuForStats = Game.cpu.getUsed() - cpuStart;
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

        Memory.stats.roomStats = {
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
        Memory.stats.creepStats = this.generateCreepStatistics(Game.creeps);
    }

    private static generateCreepStatistics(creeps: Creep[] | typeof Game.creeps): CreepStatistics {
        return {
            totalCreeps: _.size(creeps),
            creepsByRole: _.countBy(creeps, c => c.memory.role)
        };
    }

    private static exportUserStatistics() {
        Memory.stats.userStats = {
            ...Memory.stats.userStats,
            time: Game.time,
            cpu: Game.cpu.getUsed(),
            bucket: Game.cpu.bucket,
            memory: RawMemory.get().length,
            gcl: Game.gcl.level
        };
    }

    public static registerCreepIntent(creepName: string) {
        if (Game.time != Statistics.lastCreepIntentTick) {
            Memory.stats.userStats.cpuForIntents = 0;
            Statistics.lastCreepIntentTick = Game.time;
            Statistics.creepIntentRegistry = new Set();
        }

        if (Statistics.creepIntentRegistry.has(creepName)) return;

        Memory.stats.userStats.cpuForIntents! += 0.2;
        Statistics.creepIntentRegistry.add(creepName);
    }

    public static registerPathfindingCpuUsage(cpuUsage: number) {
        let pathfindingTotalCpuUsage = Memory.stats.userStats.cpuForPathfinding ?? 0;

        if (Game.time != Statistics.lastPathfindingUsageTick) {
            pathfindingTotalCpuUsage = 0;
            Statistics.lastPathfindingUsageTick = Game.time;
        }

        Memory.stats.userStats.cpuForPathfinding = pathfindingTotalCpuUsage + cpuUsage;
    }
}
