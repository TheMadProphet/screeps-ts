import Body from "./body";
import harvesterSpawner from "./roles/harvester";
import builderSpawner from "./roles/builder";

const roles: Record<CreepRole, RoleSpawner> = {
    Harvester: harvesterSpawner,
    Builder: builderSpawner,
    Upgrader: harvesterSpawner,
    Handyman: harvesterSpawner,
    Filler: harvesterSpawner
};

(function (this: typeof StructureSpawn.prototype) {
    this.automate = function () {
        this.creepsByRole = {}; // todo: is it needed?

        for (const name in Memory.creeps) {
            const creep = Game.creeps[name];
            const creeps = this.creepsByRole[creep.memory.role];
            if (!creeps) {
                this.creepsByRole[creep.memory.role] = [creep];
            } else {
                creeps.push(creep);
            }
        }

        _.forEach(roles, creepSpawner => {
            creepSpawner.spawn(this);
        });

        this.displayVisuals();
    };

    this.spawn = function (body: Body, memory: CreepMemory) {
        const creepName = `${memory.role}[${body.cost()}]`;
        const spawnStatus = this.spawnCreep(body.getParts(), creepName + `(${Game.time})`, {memory});

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
