interface BuilderBehavior extends RoleBehavior {
    buildConstructions(creep: Creep): void;
}

const builderBehavior: BuilderBehavior = {
    run: function (creep: Creep) {
        if (!creep.room.constructionSites.length) {
            creep.idle();
            return;
        }

        if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say("🪫");
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say("🔨");
        }

        if (creep.memory.working) {
            this.buildConstructions(creep);
        } else {
            creep.withdrawEnergy();
        }
    },

    buildConstructions(creep: Creep): void {
        const closestConstruction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)!;
        if (creep.build(closestConstruction) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestConstruction, {visualizePathStyle: {stroke: "#ffffff"}});
        }
    }
};

export default builderBehavior;