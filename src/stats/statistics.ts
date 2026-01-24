import {CreepRole} from "../constants";

declare global {
    interface Memory {
        stats: Stats;
    }

    interface Stats {
        userStats: UserStatistics;
        rooms: Record<string, RoomStatistics>;
    }

    interface UserStatistics {
        time: number;
        unixTime: number;
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
        spawner: number;
        find: number;
        other: number;

        findPerTarget: Partial<Record<string, number>>;
    }

    interface RoomStatistics {
        rcl: number;
        rclProgress: number;
        rclProgressTotal: number;
        spawnEnergy: number;
        spawnEnergyMax: number;
        spawning: number;
        storageEnergy: number;
        containerEnergy: number;
        towerEnergy: number;
        structuresMaintenance?: Record<StructureConstant, number>;
        hostileCreeps: HostileCreeps;
        hostileCreepsInColonies: Record<string, HostileCreeps>;
        creeps: Record<CreepRole, number>;
    }

    interface HostileCreeps {
        invaders: number;
        playerCreeps: {total: number; perPlayer: Record<string, number>};
    }
}

export class Statistics {
    public static onTickStart() {
        if (!Memory.stats) {
            Memory.stats = {rooms: {}, userStats: {usedCpu: {findPerTarget: {}}}} as Stats;
        }

        Memory.stats.userStats.usedCpu.pathfinding = 0;
        Memory.stats.userStats.usedCpu.find = 0;
        Memory.stats.userStats.usedCpu.spawner = 0;
        Memory.stats.userStats.usedCpu.findPerTarget = {};
    }

    public static exportAll() {
        _.forEach(Game.rooms, room => this.exportRoomStatistics(room));
        this.exportUserStatistics();
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

        const structuresMaintenance = room.memory.structuresInMaintenance?.reduce((acc, id) => {
            const structure = Game.getObjectById<AnyStructure>(id);
            if (structure) {
                const type = structure.structureType;
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        Memory.stats.rooms[room.name] = {
            rcl: room.controller?.level,
            rclProgress: room.controller.progress,
            rclProgressTotal: room.controller.progressTotal,
            spawnEnergy: room.energyAvailable,
            spawnEnergyMax: room.energyCapacityAvailable,
            spawning: room.spawn.spawning ? 1 : 0,
            storageEnergy: room.storage?.store?.energy || 0,
            containerEnergy,
            towerEnergy,
            structuresMaintenance,
            hostileCreeps: this.getHostileCreepsIn(room),
            hostileCreepsInColonies: room
                .getVisibleColonies()
                .reduce(
                    (acc, room) => ({...acc, [room.name]: this.getHostileCreepsIn(room)}),
                    {} as Record<string, HostileCreeps>
                ),
            creeps: _.reduce(
                room.creepsByRole,
                (acc, creeps, role) => {
                    return {...acc, [role]: creeps.length};
                },
                {} as Record<CreepRole, number>
            )
        };
    }

    private static getHostileCreepsIn(room: Room): HostileCreeps {
        const invaderCreeps = room.find(FIND_HOSTILE_CREEPS).filter(it => it.owner.username === "Invader");
        const playerCreeps = room.find(FIND_HOSTILE_CREEPS).filter(it => it.owner.username !== "Invader");
        const players = [...new Set(playerCreeps.map(it => it.owner.username))];

        return {
            playerCreeps: {
                total: playerCreeps.length,
                perPlayer: players.reduce((acc, player) => {
                    return {...acc, [player]: playerCreeps.filter(it => it.owner.username === player).length};
                }, {} as Record<string, number>)
            },
            invaders: invaderCreeps.length
        };
    }

    private static exportUserStatistics() {
        const intents = _.sum(Game.creeps, creep => creep.intentTracker.getIntentCount() * 0.2);
        const usedCpu = Memory.stats.userStats.usedCpu;
        Memory.stats.userStats = {
            bucket: Game.cpu.bucket,
            maxCpu: Game.cpu.limit,
            memory: RawMemory.get().length,
            gcl: Game.gcl.level,
            time: Game.time,
            unixTime: new Date().getTime(),
            usedCpu: {
                ...usedCpu,
                intents: intents,
                total: Game.cpu.getUsed(),
                other: Game.cpu.getUsed() - usedCpu.find - usedCpu.pathfinding - intents
            }
        };
    }

    public static registerPathfindingCpuUsage(cpuUsage: number) {
        Memory.stats.userStats.usedCpu.pathfinding += cpuUsage;
    }

    static registerFindCpuUsage(cpuUsage: number, target: string) {
        Memory.stats.userStats.usedCpu.find += cpuUsage;

        if (target) {
            Memory.stats.userStats.usedCpu.findPerTarget[target] =
                (Memory.stats.userStats.usedCpu.findPerTarget[target] || 0) + cpuUsage;
        }
    }

    static registerSpawnCpuUsage(cpuUsage: number) {
        Memory.stats.userStats.usedCpu.spawner += cpuUsage;
    }
}
