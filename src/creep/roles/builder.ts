const builderBehavior: RoleBehavior = {
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
            buildConstruction(creep);
        } else {
            creep.withdrawEnergy();
        }
    }
};

function buildConstruction(creep: Creep) {
    const closestConstruction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)!;
    if (creep.build(closestConstruction) === ERR_NOT_IN_RANGE) {
        creep.moveTo(closestConstruction, {visualizePathStyle: {stroke: "#ffffff"}});
    }
}

export default builderBehavior;
