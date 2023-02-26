const minerBehavior: RoleBehavior = {
    run: function (creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
        }

        const source = Game.getObjectById(creep.memory.assignedSource!)!;
        const harvestStatus = creep.harvest(source);
        if (harvestStatus === ERR_NOT_IN_RANGE || harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
            creep.travelTo(source);

            if (harvestStatus === ERR_NOT_ENOUGH_RESOURCES) {
                creep.say("🕑");
            }
        }
    }
};

export default minerBehavior;
