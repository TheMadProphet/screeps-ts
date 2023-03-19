export {};

declare global {
    interface StructureTower {
        defendAgainstInvaders(): void;

        autoRepair(): void;
    }
}

(function (this: typeof StructureTower.prototype) {
    this.defendAgainstInvaders = function () {
        const closestInvader = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: it => it.owner.username === "Invader"
        });

        if (closestInvader) {
            this.attack(closestInvader);
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
