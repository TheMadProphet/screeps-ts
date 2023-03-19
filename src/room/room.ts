import RoomInfrastructure from "./constructor/infrastructure";
import RoomStructures from "./constructor/structures";
import workerOrganizer, {WorkerTask, workerTasks} from "../creep/workerOrganizer";
import {CreepRole, roles, WORKER} from "../constants";

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
        const path = this.findPath(from, to, {ignoreRoads: true, ignoreCreeps: true});

        for (const i in path) {
            const pos = path[i];

            if (to.x !== pos.x || to.y !== pos.y) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.buildBiDirectionalRoad = function (pos1, pos2) {
        this.buildRoad(pos1, pos2);

        const fromPos1 = PathFinder.search(pos1, {pos: pos2, range: 1});
        const fromPos2 = PathFinder.search(pos2, {pos: pos1, range: 0});

        const path = [...fromPos1.path, ...fromPos2.path];
        for (const i in path) {
            const pos = path[i];

            if ((pos1.x !== pos.x || pos1.y !== pos.y) && (pos2.x !== pos.x || pos2.y !== pos.y)) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.fillersAreEnabled = function () {
        return (
            this.controller != undefined &&
            this.controller.level >= 4 &&
            this.availableExtension === 0 &&
            this.storage !== null &&
            this.storage !== undefined
        );
    };

    this.hasEnergyEmergency = function () {
        if (!this.storage) return false;

        return this.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= this.energyCapacityAvailable * 2;
    };

    this.getColonies = function () {
        if (!this.memory.colonies) return [];

        return this.memory.colonies;
    };

    this.isBeingReserved = function () {
        if (!this.controller?.reservation?.ticksToEnd) return false;

        return this.controller.reservation.ticksToEnd >= 1;
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

Object.defineProperty(Room.prototype, "availableExtension", {
    get: function () {
        if (!this._availableExtension) {
            this._availableExtension = getAvailableStructure(this, STRUCTURE_EXTENSION);
        }

        return this._availableExtension;
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
