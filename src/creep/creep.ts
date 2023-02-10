const roleBehaviors: Record<CreepRole, RoleBehavior> = {
    Harvester: {},
    Builder: {},
    Upgrader: {},
    Handyman: {},
    Filler: {}
};

(function (this: typeof Creep.prototype) {
    this.runRole = function () {
        roleBehaviors[this.memory.role].run(this);
    };

    this.idle = function () {
        const afkFlag = Game.flags["AFK"];
        if (afkFlag) {
            this.moveTo(afkFlag);
        }

        this.say("💤");
    };

    this.withdrawEnergy = function (includeSpawn = true) {
        const energyRepository = this.findEnergyRepository(includeSpawn);

        if (energyRepository && !this.room.hasEnergyEmergency()) {
            this.withdrawFrom(energyRepository);
        } else {
            this.idle();
        }
    };

    this.findEnergyRepository = function (includeSpawn = true) {
        if (this.room.fillersAreEnabled()) return this.room.storage;

        const closestContainerWithEnergy = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50
        });

        if (closestContainerWithEnergy) return closestContainerWithEnergy;

        if (includeSpawn && this.room.spawn.canBeUsedAsStorage()) {
            return this.room.spawn;
        }

        return null;
    };

    this.withdrawFrom = function (target, resource = RESOURCE_ENERGY) {
        if (this.withdraw(target, resource) === ERR_NOT_IN_RANGE) {
            this.moveTo(target, {visualizePathStyle: {stroke: "#ffaa00"}});
        }
    };

    this.transferTo = function (target, resource = RESOURCE_ENERGY) {
        if (this.transfer(target, resource) === ERR_NOT_IN_RANGE) {
            this.moveTo(target, {visualizePathStyle: {stroke: "#ffaa00"}});
        }
    };

    this.fillSpawnsWithEnergy = function () {
        const closestStructure = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (closestStructure) {
            if (this.transfer(closestStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestStructure, {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return OK;
        }

        return ERR_FULL;
    };

    this.fillContainersWithEnergy = function () {
        const closestContainer = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (closestContainer) {
            if (this.transfer(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer, {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return OK;
        }

        return ERR_FULL;
    };
}).call(Creep.prototype);
