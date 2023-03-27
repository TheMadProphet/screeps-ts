export {};

declare global {
    interface StructureTower {
        automate(attackOnlyInvaders?: boolean): void;

        autoRepair(): void;
    }
}

(function (this: typeof StructureTower.prototype) {
    this.automate = function (attackOnlyInvaders) {
        const damagedCreeps = this.room.find(FIND_MY_CREEPS, {filter: it => it.hits != it.hitsMax});
        if (damagedCreeps.length) {
            this.heal(damagedCreeps[0]);
            return;
        }

        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: it => attackOnlyInvaders || it.owner.username === "Invader"
        });

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
