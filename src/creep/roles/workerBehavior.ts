import {WorkerTask, workerTasks} from "../workerOrganizer";
import roomBuilder from "../roomBuilder";
import roomRepairer from "../roomRepairer";
import {offsetX, offsetY} from "../../utils/excuseMe";

declare global {
    interface CreepMemory {
        task?: WorkerTask;
    }
}

class WorkerBehavior implements RoleBehavior {
    run(creep: Creep): void {
        if (creep.memory.task === workerTasks.DECONSTRUCT) {
            this.runDeconstructTask(creep);
            return;
        }

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
            creep.giveWay();
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
            } else if (
                creep.pos.isEqualTo(constructionSite.pos) &&
                creep.isHome() &&
                constructionSite.structureType !== STRUCTURE_ROAD
            ) {
                creep.suicide();
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

        if (!creep.pos.inRangeTo(controller, 3)) {
            creep.travelTo(controller, {range: 3});
            return;
        }

        creep.upgradeController(controller);

        // Move closer to controller
        if (!creep.pos.isNearTo(controller)) {
            const dir = creep.pos.getDirectionTo(controller);
            const prev = dir === 1 ? 8 : ((dir - 1) as DirectionConstant);
            const next = dir === 8 ? 1 : ((dir + 1) as DirectionConstant);

            if (this.canMoveInDirection(creep, dir)) {
                creep.move(dir);
            } else if (this.canMoveInDirection(creep, prev)) {
                creep.move(prev);
            } else if (this.canMoveInDirection(creep, next)) {
                creep.move(next);
            }
        }
    }

    private runRepairerTask(creep: Creep) {
        if (!creep.isHome()) {
            return creep.travelToHome();
        }

        const toRepair = roomRepairer.findStructureToRepair(creep);
        if (toRepair) {
            if (creep.repair(toRepair) === ERR_NOT_IN_RANGE) {
                creep.travelTo(toRepair, {range: 3});
            }
        }
    }

    private runDeconstructTask(creep: Creep) {
        if (creep.store.getFreeCapacity() === 0) {
            creep.transferTo(creep.room.storage!);
            return;
        }

        const flag = Game.flags[`${creep.room.name}-deconstruct`];
        if (!flag) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (!creep.pos.isNearTo(flag)) {
            creep.travelTo(flag, {range: 1});
            return;
        }

        const structure = flag.pos.lookFor(LOOK_STRUCTURES)[0];
        if (structure) {
            if (creep.dismantle(structure) !== OK) {
                creep.say("?");
            }
        } else {
            creep.idle();
            creep.say(`⚠`);
        }
    }

    private canMoveInDirection(creep: Creep, dir: DirectionConstant) {
        const nextX = creep.pos.x + offsetX[dir];
        const nextY = creep.pos.y + offsetY[dir];

        const terrain = creep.room.lookForAt(LOOK_TERRAIN, nextX, nextY);
        if (terrain.some(it => it === "wall")) return false;

        const creeps = creep.room.lookForAt(LOOK_CREEPS, nextX, nextY);
        if (creeps.length > 0) return false;

        const structures = creep.room
            .lookForAt(LOOK_STRUCTURES, nextX, nextY)
            .filter(it => it.structureType !== STRUCTURE_RAMPART && it.structureType !== STRUCTURE_ROAD);
        if (structures.length > 0) return false;

        return true;
    }
}

const workerBehavior = new WorkerBehavior();
export default workerBehavior;
