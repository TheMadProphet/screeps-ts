const minerBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
        }

        if (creep.memory.assignedRoom != creep.room.name) {
            creep.moveToAssignedRoom();
        } else {
            const source = Game.getObjectById(creep.memory.assignedSource!)!;
            if (creep.harvestFrom(source) === ERR_NOT_ENOUGH_RESOURCES) {
                creep.say("🕑");
            }
        }
    }
};

export default minerBehavior;
