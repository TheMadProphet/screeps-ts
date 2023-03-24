import {WorkerTask, workerTasks} from "../workerOrganizer";
import roomBuilder from "../roomBuilder";

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
        const constructionSite = roomBuilder.findConstructionSite(creep);
        if (constructionSite) {
            if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite, {ignoreRoads: true});
            }
        } else {
            creep.idle();
            creep.say("⚠");
        }
    }

    runUpgraderTask(creep: Creep) {
        const controller = creep.room.controller!;

        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            creep.travelTo(controller, {ignoreRoads: true, ignoreCreeps: false});
        }
    }

    private runRepairerTask(creep: Creep) {
        const closestStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.hits / structure.hitsMax <= 0.95
        });

        if (closestStructure) {
            if (creep.repair(closestStructure) === ERR_NOT_IN_RANGE) {
                creep.travelTo(closestStructure, {ignoreRoads: true});
            }
        }
    }
}

const workerBehavior = new WorkerBehavior();
export default workerBehavior;
