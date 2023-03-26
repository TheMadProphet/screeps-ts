import fillerBehavior from "./roles/fillerBehavior";
import {CreepRole, EMERGENCY_UNIT, FILLER, HAULER, MINER, RESERVER, SCOUT, WORKER} from "../constants";
import minerBehavior from "./roles/minerBehavior";
import haulerBehavior from "./roles/haulerBehavior";
import workerBehavior from "./roles/workerBehavior";
import scoutBehavior from "./roles/scoutBehavior";
import reserverBehavior from "./roles/reserverBehavior";
import emergencyUnitBehavior from "./roles/emergencyUnitBehavior";

const roleBehaviors: Record<CreepRole, RoleBehavior> = {
    [EMERGENCY_UNIT]: emergencyUnitBehavior,
    [MINER]: minerBehavior,
    [HAULER]: haulerBehavior,
    [WORKER]: workerBehavior,
    [FILLER]: fillerBehavior,
    [SCOUT]: scoutBehavior,
    [RESERVER]: reserverBehavior
};

(function (this: typeof Creep.prototype) {
    this.runRole = function () {
        roleBehaviors[this.memory.role].run(this);

        this.memory.previousPos = this.pos;
        this.memory.previousFatigue = this.fatigue;
    };

    this.idle = function () {
        const afkFlag = Game.flags["AFK"];
        if (afkFlag) {
            this.moveTo(afkFlag);
        }

        this.say("💤");
        this.giveWay();
    };

    this.withdrawEnergy = function (includeSpawn = true) {
        if (!this.isHome()) {
            this.travelToHome();
            return;
        }

        const energyRepository = this.findEnergyRepository(includeSpawn);
        if (energyRepository && !this.room.hasEnergyEmergency()) {
            this.withdrawFrom(energyRepository);
        } else {
            const closestDroppedResource = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if (closestDroppedResource) {
                this.pickupResource(closestDroppedResource);
            } else {
                this.idle();
            }
        }
    };

    this.findEnergyRepository = function (includeSpawn = true) {
        if (this.room.fillersAreEnabled() && this.room.storage) return this.room.storage;

        const closestContainerWithEnergy = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure =>
                structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 50
        });
        if (closestContainerWithEnergy) return closestContainerWithEnergy;

        if (includeSpawn && this.room.spawn.canBeUsedAsStorage()) {
            return this.room.spawn;
        }

        return null;
    };

    this.harvestFrom = function (target: Source) {
        const harvestStatus = this.harvest(target);
        if (harvestStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }

        return harvestStatus;
    };

    this.withdrawFrom = function (target, resource = RESOURCE_ENERGY, amount = undefined) {
        const withdrawStatus = this.withdraw(target, resource, amount);
        if (withdrawStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }

        return withdrawStatus;
    };

    this.pickupResource = function (resource: Resource) {
        const pickupStatus = this.pickup(resource);
        if (pickupStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(resource);
        }

        return pickupStatus;
    };

    this.transferTo = function (target, resource = RESOURCE_ENERGY) {
        if (this.transfer(target, resource) === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }
    };

    this.fillSpawnsWithEnergy = function () {
        const closestStructure = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: structure => {
                return (
                    (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (closestStructure) {
            this.transferTo(closestStructure);
        }
    };

    this.movedLastTick = function () {
        if (!this.memory.previousPos) return true;

        return this.pos.x !== this.memory.previousPos.x || this.pos.y !== this.memory.previousPos.y;
    };

    this.isHome = function () {
        return this.room.name === this.memory.home;
    };

    this.isInAssignedRoom = function () {
        if (!this.memory.assignedRoom) return true;

        return this.room.name === this.memory.assignedRoom;
    };

    this.travelToHome = function () {
        if (this.isHome()) {
            return;
        }

        this.travelTo(new RoomPosition(25, 25, this.memory.home), {range: 20});
    };

    this.travelToAssignedRoom = function () {
        if (!this.memory.assignedRoom || this.isInAssignedRoom()) {
            return;
        }

        this.travelTo(new RoomPosition(25, 25, this.memory.assignedRoom), {range: 20});
    };
}).call(Creep.prototype);
