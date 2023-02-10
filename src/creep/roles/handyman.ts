const handymanBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say("🪫");
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say("🔩");
        }

        if (!creep.memory.working) {
            creep.withdrawEnergy();
            return;
        }

        const repairableStructures = getRepairableStructures(creep.room);
        if (repairableStructures.length) {
            if (creep.repair(repairableStructures[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(repairableStructures[0], {visualizePathStyle: {stroke: "#ffffff"}});
            }

            return;
        }

        const ruins = creep.room.find(FIND_RUINS, {filter: ruin => ruin.store.getUsedCapacity() > 0});
        if (ruins.length) {
            if (creep.store.getUsedCapacity() > 0) {
                creep.fillSpawnsWithEnergy();
            } else {
                if (creep.withdraw(ruins[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(ruins[0], {visualizePathStyle: {stroke: "#ffffff"}});
                }
            }

            return;
        }

        const droppedEnergies = creep.room.find(FIND_DROPPED_RESOURCES);
        if (droppedEnergies.length) {
            if (creep.store.getUsedCapacity() > 0) {
                creep.fillSpawnsWithEnergy();
            } else {
                if (creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergies[0], {visualizePathStyle: {stroke: "#ffffff"}});
                }
            }

            return;
        }

        creep.idle();
    }
};

const getRepairableStructures = (room: Room) => {
    const myStructures = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.hits / structure.hitsMax < 0.9
    });

    if (myStructures.length) return myStructures;

    const containers = room.find(FIND_STRUCTURES, {
        filter: structure => structure.hits / structure.hitsMax < 0.9 && structure.structureType === STRUCTURE_CONTAINER
    });

    if (containers.length) return containers;

    return room.find(FIND_STRUCTURES, {
        filter: structure => structure.hits / structure.hitsMax < 0.9 && structure.structureType === STRUCTURE_ROAD
    });
};

export default handymanBehavior;
