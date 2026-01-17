import {WorkerTask, workerTasks} from "../workerOrganizer";
import roomBuilder from "../roomBuilder";

declare global {
    interface CreepMemory {
        task?: WorkerTask;
    }
}

class WorkerBehavior implements RoleBehavior {
    run(creep: Creep): void {
        if (creep.store.getUsedCapacity() === 0) return this.gatherEnergy(creep);

        // TODO: Ignore roads if 1:1 move parts
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

    private gatherEnergy(creep: Creep) {
        if (creep.isHome()) {
            if (creep.memory.task === workerTasks.UPGRADE && creep.room.controllerLink) {
                creep.withdrawFrom(creep.room.controllerLink);
            } else {
                creep.withdrawEnergy();
            }
        } else {
            this.gatherEnergyInRemote(creep);
        }
    }

    private gatherEnergyInRemote(creep: Creep) {
        const closestDroppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: it => it.amount > 250
        });
        const closestContainerWithEnergy = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: it => it.structureType === STRUCTURE_CONTAINER && it.store.getUsedCapacity() > 500
        });

        if (closestDroppedEnergy && closestContainerWithEnergy) {
            if (creep.pos.getRangeTo(closestDroppedEnergy) < creep.pos.getRangeTo(closestContainerWithEnergy)) {
                creep.pickupResource(closestDroppedEnergy);
            } else {
                creep.withdrawFrom(closestContainerWithEnergy);
            }
        } else if (closestContainerWithEnergy) {
            creep.withdrawFrom(closestContainerWithEnergy);
        } else if (closestDroppedEnergy) {
            creep.pickupResource(closestDroppedEnergy);
        } else {
            creep.travelToHome();
        }
    }

    private runBuilderTask(creep: Creep) {
        const constructionSite = roomBuilder.findConstructionSite(creep);
        if (constructionSite) {
            creep.getOffExit();
            if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
                creep.travelTo(constructionSite, {ignoreCreeps: false, range: 3});
            }
        } else {
            creep.idle();
            creep.say("⚠");
        }
    }

    private runUpgraderTask(creep: Creep) {
        const controller = creep.room.controller;
        if (!controller || !creep.isHome()) {
            creep.travelToHome();
            return;
        }

        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            creep.travelTo(controller, {ignoreCreeps: false, range: 3});
        }
    }

    private runRepairerTask(creep: Creep) {
        if (!creep.isHome()) {
            return creep.travelToHome();
        }

        const closestStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => structure.hits / structure.hitsMax < 0.95 && structure.structureType !== "constructedWall"
        });

        if (closestStructure) {
            if (creep.repair(closestStructure) === ERR_NOT_IN_RANGE) {
                creep.travelTo(closestStructure, {range: 3});
            }
        }
    }
}

const workerBehavior = new WorkerBehavior();
export default workerBehavior;
