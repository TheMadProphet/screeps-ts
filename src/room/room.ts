import RoomInfrastructure from "./constructor/infrastructure/infrastructure";
import RoomStructures from "./constructor/structures";
import workerOrganizer, {WorkerTask, workerTasks} from "../creep/workerOrganizer";
import {CreepRole, roles, WORKER} from "../constants";
import {Traveler} from "../utils/traveler/traveler";

declare global {
    interface RoomMemory {
        sources: Id<Source>[];
        hadInvaderCreepLastTick?: boolean;
    }
}

class ExtendedRoom extends Room {
    @AddToPrototype
    automate() {
        if (!this.controller?.my) return;

        groupCreeps(this);

        new RoomStructures(this).build();
        new RoomInfrastructure(this, this.controller).build();

        this.spawn.automate();

        this.find<StructureTower>(FIND_STRUCTURES, {
            filter: structure => structure.structureType === STRUCTURE_TOWER
        }).forEach(it => it.automate(true));

        workerOrganizer.organizeWorkersIn(this);
        this.getVisibleColonies().forEach(it => {
            it.memory.hadInvaderCreepLastTick =
                it.find(FIND_HOSTILE_CREEPS).filter(it => it.owner.username === "Invader").length > 0;
        });
    }

    @AddToPrototype
    buildRoad(from: RoomPosition, to: RoomPosition) {
        const path = Traveler.findTravelPath(from, to, {ignoreCreeps: true}).path;

        for (const i in path) {
            const pos = path[i];

            if (to.x !== pos.x || to.y !== pos.y) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    }

    @AddToPrototype
    fillersAreEnabled() {
        return Boolean(this.storage);
    }

    @AddToPrototype
    hasEnergyEmergency() {
        if (!this.storage) return false;

        return this.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= this.energyCapacityAvailable * 2;
    }

    @AddToPrototype
    getAllColonies() {
        if (!this.memory.colonies) return [];

        return this.memory.colonies;
    }

    @AddToPrototype
    getVisibleColonies() {
        if (!this.memory.colonies) return [];

        return this.memory.colonies.map(it => Game.rooms[it]).filter(it => Boolean(it));
    }

    @AddToPrototype
    isBeingReserved() {
        if (!this.controller?.reservation?.ticksToEnd) return false;

        return this.controller.reservation.ticksToEnd >= 1;
    }

    @AddToPrototype
    extensionsAreBuilt() {
        return !this.canBuildStructure(STRUCTURE_EXTENSION);
    }

    @AddToPrototype
    canBuildStructure(structureType: BuildableStructureConstant) {
        if (!this.controller) return false;

        const currentlyBuilt = this.find(FIND_MY_STRUCTURES, {
            filter: structure => structure.structureType === structureType
        }).length;

        const maxAvailable = CONTROLLER_STRUCTURES[structureType][this.controller.level];

        return maxAvailable - currentlyBuilt > 0;
    }
}

function AddToPrototype(target: any, methodName: string, descriptor: PropertyDescriptor) {
    // @ts-ignore
    Creep.prototype[methodName] = function (...args: any[]) {
        descriptor.value.apply(this, args);
    };
}

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

        canBuildStructure(structureType: BuildableStructureConstant): boolean;
    }
}
