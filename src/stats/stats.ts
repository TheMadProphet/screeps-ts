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
        cpu: number;
        cpuForStats: number;
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

    public static exportRoomStatistics(room: Room) {
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

    public static exportCreepStatistics() {
        Memory.stats.creepStats = this.generateCreepStatistics(Game.creeps);
    }

    public static generateCreepStatistics(creeps: Creep[] | typeof Game.creeps): CreepStatistics {
        return {
            totalCreeps: _.size(creeps),
            creepsByRole: _.countBy(creeps, c => c.memory.role)
        };
    }

    public static exportUserStatistics() {
        const userStats = Memory.stats.userStats;

        userStats.gcl = Game.gcl.level;
        userStats.memory = RawMemory.get().length;
        userStats.bucket = Game.cpu.bucket;
        userStats.cpu = Game.cpu.getUsed();
    }
}
