const harvesterBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
        }

        if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = false;
            creep.say("📦");
        }
        if (!creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = true;
            creep.say("⛏");
        }

        if (creep.memory.working) {
            harvest(creep);
        } else {
            storeEnergy(creep);
        }
    }
};

function harvest(creep: Creep) {
    const source = Game.getObjectById(creep.memory.assignedSource!)!;
    const harvestStatus = creep.harvest(source);
    if (harvestStatus === ERR_NOT_IN_RANGE || harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
        creep.moveTo(source, {visualizePathStyle: {stroke: "#ffaa00"}});

        if (harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
            creep.say("🕑");
        }
    }
}

function storeEnergy(creep: Creep) {
    if (creep.room.fillersAreEnabled()) {
        if (creep.fillContainersWithEnergy() === ERR_FULL) {
            creep.idle();
        }
    } else {
        if (creep.fillSpawnsWithEnergy() === ERR_FULL && creep.fillContainersWithEnergy() === ERR_FULL) {
            creep.idle();
        }
    }
}

export default harvesterBehavior;
