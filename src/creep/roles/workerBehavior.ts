import {WorkerTask, workerTasks} from "../workerOrganizer";

declare global {
    interface CreepMemory {
        task?: WorkerTask;
    }
}

class WorkerBehavior implements RoleBehavior {
    run(creep: Creep): void {
        if (creep.store.getUsedCapacity() === 0) return creep.withdrawEnergy();

        switch (creep.memory.task) {
            case workerTasks.UPGRADE:
                this.runUpgraderTask(creep);
                break;
            case workerTasks.BUILD:
                this.runBuilderTask(creep);
                break;
            case workerTasks.REPAIR:
                this.runRepairerTask(creep);
                break;
        }

        creep.giveWay();
    }

    runBuilderTask(creep: Creep) {
        const closestConstruction = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)!;

        if (creep.build(closestConstruction) === ERR_NOT_IN_RANGE) {
            creep.travelTo(closestConstruction);
        }
    }

    runUpgraderTask(creep: Creep) {
        const controller = creep.room.controller!;

        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            creep.travelTo(controller);
        }
    }

    private runRepairerTask(creep: Creep) {
        const repairableStructures = creep.room.find(FIND_STRUCTURES, {
            filter: structure => structure.hits / structure.hitsMax < 0.3
        });

        if (repairableStructures.length) {
            if (creep.repair(repairableStructures[0]) === ERR_NOT_IN_RANGE) {
                creep.travelTo(repairableStructures[0]);
            }
        }
    }
}

const workerBehavior = new WorkerBehavior();
export default workerBehavior;
