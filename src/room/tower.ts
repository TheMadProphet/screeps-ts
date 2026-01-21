export {};

declare global {
    interface StructureTower {
        automate(attackOnlyInvaders?: boolean): void;

        repairAmount(structure: AnyStructure): number;
    }
}

(function (this: typeof StructureTower.prototype) {
    this.automate = function (attackOnlyInvaders) {
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter: it => attackOnlyInvaders || it.owner.username === "Invader"
        });
        if (closestHostile) {
            this.attack(closestHostile);
            return;
        }

        const damagedCreeps = this.room.find(FIND_MY_CREEPS, {filter: it => it.hits != it.hitsMax});
        if (damagedCreeps.length) {
            this.heal(damagedCreeps[0]);
            return;
        }

        if (Game.time % 10 !== 0) return;

        const closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType !== STRUCTURE_WALL &&
                structure.hitsMax - structure.hits >= this.repairAmount(structure)
        });
        if (closestDamagedStructure) {
            this.repair(closestDamagedStructure);
        }
    };

    this.repairAmount = function (structure: AnyStructure) {
        const distance = this.pos.getRangeTo(structure.pos);
        let repairPower = TOWER_POWER_REPAIR;

        if (distance > TOWER_OPTIMAL_RANGE) {
            if (distance >= TOWER_FALLOFF_RANGE) {
                repairPower *= 1 - TOWER_FALLOFF;
            } else {
                const falloffFactor = (distance - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
                repairPower *= 1 - TOWER_FALLOFF * falloffFactor;
            }
        }

        return Math.floor(repairPower);
    };
}).call(StructureTower.prototype);
