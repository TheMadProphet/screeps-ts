const fillerBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = false;
            creep.say("🪫");
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say("🔋");
        }

        if (!creep.memory.working) {
            gatherEnergy(creep);
        } else {
            fill(creep);
        }
    }
};

function gatherEnergy(creep: Creep) {
    if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
        creep.withdrawFrom(creep.room.storage!);
    } else {
        const containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50
        });

        if (containersWithEnergy.length) {
            creep.withdrawFrom(containersWithEnergy[0]);
        } else {
            creep.idle();
        }
    }
}

function fill(creep: Creep) {
    if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable) {
        creep.fillSpawnsWithEnergy();
    } else {
        const towersWithMissingEnergy = creep.room.find(FIND_MY_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (towersWithMissingEnergy.length) {
            creep.transferTo(towersWithMissingEnergy[0]);
        } else {
            creep.transferTo(creep.room.storage!);
        }
    }
}

export default fillerBehavior;
