import harvesterSpawner from "./roles/harvester";
import builderSpawner from "./roles/builder";
import fillerSpawner from "./roles/filler";
import handymanSpawner from "./roles/handyman";
import upgraderSpawner from "./roles/upgrader";
import minerSpawner from "./roles/miner";
import {BUILDER, CreepRole, FILLER, HANDYMAN, HARVESTER, HAULER, MINER, roles, UPGRADER} from "../constants";
import haulerSpawner from "./roles/hauler";

const roleSpawners: Record<CreepRole, RoleSpawner> = {
    [HARVESTER]: harvesterSpawner,
    [MINER]: minerSpawner,
    [HAULER]: haulerSpawner,
    [BUILDER]: builderSpawner,
    [UPGRADER]: upgraderSpawner,
    [HANDYMAN]: handymanSpawner,
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
        const spawnStatus = this.spawnCreep(parts, creepName + `(${Game.time})`, {memory});

        if (spawnStatus === ERR_NOT_ENOUGH_ENERGY) {
            this.memory.hasEnoughEnergy = false;
            this.memory.wantsToSpawn = creepName;
        }

        return spawnStatus;
    };

    this.displayVisuals = function () {
        if (!this.memory.hasEnoughEnergy) {
            this.room.visual.text(`🪫`, this.pos.x, this.pos.y - 1);
        }

        if (this.spawning) {
            this.room.visual.text(`🛠 ${this.spawning.name}`, this.pos.x + 1, this.pos.y, {align: "left"});
        }
    };

    this.canBeUsedAsStorage = function () {
        return this.memory.hasEnoughEnergy && this.store.getUsedCapacity(RESOURCE_ENERGY) > 50;
    };
}).call(StructureSpawn.prototype);
