interface UpgraderBehavior extends RoleBehavior {
    upgradeController(creep: Creep): void;
}

const upgraderBehavior: UpgraderBehavior = {
    run(creep: Creep) {
        if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say("🪫");
        }
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say("🪛");
        }

        if (creep.memory.working) {
            this.upgradeController(creep);
        } else {
            creep.withdrawEnergy();
        }
    },

    upgradeController(creep: Creep) {
        if (!creep.room.controller) {
            return console.log(`Upgrader in controller-less room ${creep.room.name}:${creep.name}`);
        }

        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#ffffff"}});
        }
    }
};

export default upgraderBehavior;
