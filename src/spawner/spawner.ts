import fillerSpawner from "./roles/fillerSpawner";
import minerSpawner from "./roles/minerSpawner";
import {CreepRole, EMERGENCY_UNIT, FILLER, HAULER, MINER, RESERVER, SCOUT, WORKER} from "../constants";
import haulerSpawner from "./roles/haulerSpawner";
import workerSpawner from "./roles/workerSpawner";
import scoutSpawner from "./roles/scoutSpawner";
import reserverSpawner from "./roles/reserverSpawner";
import emergencyUnitSpawner from "./roles/emergencyUnitSpawner";

const roleSpawners: Partial<Record<CreepRole, RoleSpawner>> = {
    [EMERGENCY_UNIT]: emergencyUnitSpawner,
    [FILLER]: fillerSpawner,
    [RESERVER]: reserverSpawner,
    [HAULER]: haulerSpawner,
    [MINER]: minerSpawner,
    [SCOUT]: scoutSpawner,
    [WORKER]: workerSpawner
};

(function (this: typeof StructureSpawn.prototype) {
    let spawnWasIssued = false;

    this.automate = function () {
        this.memory.hasEnoughEnergy = true;
        spawnWasIssued = false;

        if (!this.spawning) {
            for (const roleSpawner of Object.values(roleSpawners)) {
                roleSpawner.spawn(this);

                if (spawnWasIssued) {
                    break;
                }
            }
        }

        this.displayVisuals();
    };

    this.spawn = function ({body, memory}) {
        spawnWasIssued = true;

        const creepName = `${memory.role}`;
        const creepMemory = {home: this.room.name, ...memory};
        const spawnStatus = this.spawnCreep(body.getParts(), creepName + `(${Game.time})`, {memory: creepMemory});

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
