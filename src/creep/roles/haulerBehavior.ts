import {Statistics} from "../../stats/statistics";

class HaulerBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.idle();
            creep.say("⚠");
            return;
        }

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        if (creep.memory.working) {
            this.retrieveEnergy(creep);
        } else {
            this.gatherEnergy(creep, creep.memory.assignedSource);
        }

        if (creep.getActiveBodyparts(WORK) > 0) {
            const damagedRoads = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: it => it.structureType === STRUCTURE_ROAD && it.hitsMax - it.hits > 100
            });

            if (damagedRoads.length > 0) {
                creep.repair(damagedRoads[0]);
                Statistics.registerCreepIntent(creep.name + "repair"); // TODO: Handle simultaneous actions
            }
        }

        creep.giveWay();
    }

    retrieveEnergy(creep: Creep) {
        if (creep.isHome()) {
            creep.getOffExit();
            creep.fillSpawnsWithEnergy();
        } else {
            creep.travelToHome();
        }
    }

    gatherEnergy(creep: Creep, sourceId: Id<Source>) {
        if (creep.memory.assignedRoom != creep.room.name) {
            creep.travelToAssignedRoom();
        } else {
            creep.getOffExit();

            const source = Game.getObjectById(sourceId);
            if (source) {
                if (source.container) {
                    creep.withdrawFrom(source.container);
                } else {
                    this.pickupEnergyNearSource(creep, source);
                }
            }
        }
    }

    pickupEnergyNearSource(creep: Creep, source: Source) {
        const droppedEnergies = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === RESOURCE_ENERGY
        });

        if (!droppedEnergies?.length) {
            creep.giveWay();
        } else if (creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
            creep.travelTo(droppedEnergies[0]);
        }
    }
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
