import fillerSpawner from "./roles/fillerSpawner";
import minerSpawner from "./roles/minerSpawner";
import {CreepRole, EMERGENCY_UNIT, FILLER, HAULER, MINER, RESERVER, roles, SCOUT, WORKER} from "../constants";
import haulerSpawner from "./roles/haulerSpawner";
import workerSpawner from "./roles/workerSpawner";
import scoutSpawner from "./roles/scoutSpawner";
import reserverSpawner from "./roles/reserverSpawner";
import emergencyUnitSpawner from "./roles/emergencyUnitSpawner";

const roleSpawners: Partial<Record<CreepRole, RoleSpawner>> = {
    [EMERGENCY_UNIT]: emergencyUnitSpawner,
    [RESERVER]: reserverSpawner,
    [HAULER]: haulerSpawner,
    [MINER]: minerSpawner,
    [SCOUT]: scoutSpawner,
    [WORKER]: workerSpawner,
    [FILLER]: fillerSpawner
};

(function (this: typeof StructureSpawn.prototype) {
    this.automate = function () {
        this.creepsByRole = roles.reduce((acc, role) => {
            return {...acc, [role]: []};
        }, {} as {[role in CreepRole]: Creep[]});
        for (const name in Memory.creeps) {
            const creep = Game.creeps[name];
            this.creepsByRole[creep.memory.role].push(creep);
        }
        this.memory.hasEnoughEnergy = true;

        _.forEach(roleSpawners, roleSpawner => {
            return !roleSpawner.spawn(this);
        });

        this.displayVisuals();
    };

    this.spawn = function ({parts, memory}) {
        const creepName = `${memory.role}`;
        const creepMemory = {home: this.room.name, ...memory};
        const spawnStatus = this.spawnCreep(parts, creepName + `(${Game.time})`, {memory: creepMemory});

        if (spawnStatus === ERR_NOT_ENOUGH_ENERGY) {
            this.memory.hasEnoughEnergy = false;
            this.memory.wantsToSpawn = creepName;
        }

        return spawnStatus;
    };

    this.displayVisuals = function () {
        if (this.spawning) {
            this.room.visual.text(`🛠 ${this.spawning.name}`, this.pos.x + 1, this.pos.y, {align: "left"});

            if (!this.memory.hasEnoughEnergy) {
                this.room.visual.text(`🪫`, this.pos.x, this.pos.y - 1);
            }
        } else if (!this.memory.hasEnoughEnergy) {
            this.room.visual.text(`🪫 ${this.memory.wantsToSpawn}`, this.pos.x + 1, this.pos.y, {align: "left"});
        }
    };

    this.canBeUsedAsStorage = function () {
        return this.memory.hasEnoughEnergy && this.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
    };
}).call(StructureSpawn.prototype);
