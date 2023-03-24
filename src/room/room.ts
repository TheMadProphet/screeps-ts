import RoomInfrastructure from "./constructor/infrastructure/infrastructure";
import RoomStructures from "./constructor/structures";
import workerOrganizer, {WorkerTask, workerTasks} from "../creep/workerOrganizer";
import {CreepRole, roles, WORKER} from "../constants";
import {Traveler} from "../utils/traveler/traveler";

declare global {
    interface Room {
        spawn: StructureSpawn;
        creepsByRole: {
            [role in CreepRole]: Creep[];
        };
        workersByTask: {
            [task in WorkerTask]: Creep[];
        };

        automate(): void;

        buildRoad(from: RoomPosition, to: RoomPosition): void;

        fillersAreEnabled(): boolean;

        hasEnergyEmergency(): boolean;

        getAllColonies(): string[];

        getVisibleColonies(): Room[];

        isBeingReserved(): boolean;

        extensionsAreBuilt(): boolean;
    }

    interface RoomMemory {
        sources: Id<Source>[];
    }
}

(function (this: typeof Room.prototype) {
    this.automate = function () {
        if (!this.controller?.my) return;

        groupCreeps(this);

        new RoomStructures(this).build();
        new RoomInfrastructure(this).build();

        this.spawn.automate();

        this.find<StructureTower>(FIND_STRUCTURES, {
            filter: structure => structure.structureType === STRUCTURE_TOWER
        }).forEach(it => it.defendAgainstInvaders());

        workerOrganizer.organizeWorkersIn(this);
    };

    this.buildRoad = function (from, to) {
        const path = Traveler.findTravelPath(from, to, {ignoreCreeps: true}).path;

        for (const i in path) {
            const pos = path[i];

            if (to.x !== pos.x || to.y !== pos.y) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.fillersAreEnabled = function () {
        return (
            this.controller != undefined &&
            this.controller.level >= 4 &&
            this.extensionsAreBuilt() &&
            this.storage !== null &&
            this.storage !== undefined
        );
    };

    this.hasEnergyEmergency = function () {
        if (!this.storage) return false;

        return this.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= this.energyCapacityAvailable * 2;
    };

    this.getAllColonies = function () {
        if (!this.memory.colonies) return [];

        return this.memory.colonies;
    };

    this.getVisibleColonies = function () {
        if (!this.memory.colonies) return [];

        return this.memory.colonies.map(it => Game.rooms[it]).filter(it => Boolean(it));
    };

    this.isBeingReserved = function () {
        if (!this.controller?.reservation?.ticksToEnd) return false;

        return this.controller.reservation.ticksToEnd >= 1;
    };

    this.extensionsAreBuilt = function () {
        return getAvailableStructure(this, STRUCTURE_EXTENSION) === 0;
    };
}).call(Room.prototype);

Object.defineProperty(Room.prototype, "spawn", {
    get: function () {
        if (!this._spawn) {
            if (!this.memory.spawnId) {
                this.memory.spawnId = this.find(FIND_MY_SPAWNS)[0].id;
            }
            this._spawn = Game.getObjectById(this.memory.spawnId);
        }

        return this._spawn;
    },
    enumerable: false,
    configurable: true
});

function getAvailableStructure(room: Room, structureType: BuildableStructureConstant) {
    if (!room.controller) return 0;

    const currentlyBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === structureType
    }).length;

    const maxAvailable = CONTROLLER_STRUCTURES[structureType][room.controller.level];

    return maxAvailable - currentlyBuilt;
}

function groupCreeps(room: Room) {
    room.creepsByRole = roles.reduce((acc, role) => {
        return {...acc, [role]: []};
    }, {} as {[role in CreepRole]: Creep[]});

    room.workersByTask = Object.values(workerTasks).reduce((acc, role) => {
        return {...acc, [role]: []};
    }, {} as {[task in WorkerTask]: Creep[]});

    for (const name in Memory.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.home != room.name) continue;

        room.creepsByRole[creep.memory.role].push(creep);
        if (creep.memory.role === WORKER) {
            room.workersByTask[creep.memory.task!].push(creep);
        }
    }
}
