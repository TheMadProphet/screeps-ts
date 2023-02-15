import builderBehavior from "./builder";
import upgraderBehavior from "./upgrader";

const workerBehavior: RoleBehavior = {
    run(creep: Creep) {
        if (creep.store.getUsedCapacity() === 0) return creep.withdrawEnergy();

        if (creep.memory.task === "builder") {
            builderBehavior.run(creep);
        } else {
            upgraderBehavior.upgradeController(creep);
        }
    }
};

export default workerBehavior;
