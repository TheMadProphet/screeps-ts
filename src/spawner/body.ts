class Body {
    totalEnergy: number;
    parts: BodyPartConstant[];

    constructor(spawner: StructureSpawn) {
        this.totalEnergy = spawner.room.energyCapacityAvailable;
        this.parts = [];
    }

    getParts() {
        return this.parts;
    }

    addParts(parts: BodyPartConstant[], amount = 1) {
        const maxAmount = Math.trunc(this.totalEnergy / this.calculateCost(parts));
        const partsToAdd = Math.min(amount, maxAmount);

        for (let i = 0; i < partsToAdd; i++) {
            if (this.parts.length + parts.length <= 50) {
                this.parts.push(...parts);
            }
        }

        this.totalEnergy -= partsToAdd * this.calculateCost(parts);

        return this;
    }

    getPartCount(partType: BodyPartConstant) {
        return this.parts.filter(part => part === partType).length;
    }

    getCapacity() {
        return CARRY_CAPACITY * this.getPartCount(CARRY);
    }

    calculateCost(parts: BodyPartConstant[]) {
        let cost = 0;

        _.forEach(parts, part => {
            cost += BODYPART_COST[part];
        });

        return cost;
    }
}

export default Body;
