(function (this: typeof StructureTower.prototype) {
    this.autoDefend = function () {
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            this.attack(closestHostile);
        }
    };

    this.autoRepair = function () {
        const closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.hits < structure.hitsMax
        });

        if (closestDamagedStructure) {
            this.repair(closestDamagedStructure);
        }
    };
}).call(StructureTower.prototype);
