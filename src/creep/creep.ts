import fillerBehavior from "./roles/fillerBehavior";
import {CreepRole, DEFENDER, EMERGENCY_UNIT, FILLER, HAULER, MINER, RESERVER, SCOUT, WORKER} from "../constants";
import minerBehavior from "./roles/minerBehavior";
import haulerBehavior from "./roles/haulerBehavior";
import workerBehavior from "./roles/workerBehavior";
import scoutBehavior from "./roles/scoutBehavior";
import reserverBehavior from "./roles/reserverBehavior";
import emergencyUnitBehavior from "./roles/emergencyUnitBehavior";
import defenderBehavior from "./roles/defenderBehavior";

const roleBehaviors: Record<CreepRole, RoleBehavior> = {
    [EMERGENCY_UNIT]: emergencyUnitBehavior,
    [MINER]: minerBehavior,
    [HAULER]: haulerBehavior,
    [WORKER]: workerBehavior,
    [FILLER]: fillerBehavior,
    [SCOUT]: scoutBehavior,
    [RESERVER]: reserverBehavior,
    [DEFENDER]: defenderBehavior
};

class ExtendedCreep extends Creep {
    @AddToPrototype
    runRole() {
        roleBehaviors[this.memory.role].run(this);

        this.memory.previousPos = this.pos;
        this.memory.previousFatigue = this.fatigue;
    }

    @AddToPrototype
    idle() {
        const afkFlag = Game.flags["AFK"];
        if (afkFlag) {
            this.travelTo(afkFlag, {ignoreCreeps: false});
        }

        this.say("💤");
        this.giveWay();
    }

    @AddToPrototype
    withdrawEnergy(includeSpawn = true) {
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
    }

    @AddToPrototype
    findEnergyRepository(includeSpawn = true) {
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
    }

    @AddToPrototype
    harvestFrom(target: Source) {
        const harvestStatus = this.harvest(target);
        if (harvestStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }

        return harvestStatus;
    }

    @AddToPrototype
    withdrawFrom(target: Structure, resource = RESOURCE_ENERGY, amount = undefined) {
        const withdrawStatus = this.withdraw(target, resource, amount);
        if (withdrawStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }

        return withdrawStatus;
    }

    @AddToPrototype
    pickupResource(resource: Resource) {
        const pickupStatus = this.pickup(resource);
        if (pickupStatus === ERR_NOT_IN_RANGE) {
            this.travelTo(resource);
        }

        return pickupStatus;
    }

    @AddToPrototype
    transferTo(target: Structure | AnyCreep, resource = RESOURCE_ENERGY) {
        if (this.transfer(target, resource) === ERR_NOT_IN_RANGE) {
            this.travelTo(target);
        }
    }

    @AddToPrototype
    fillSpawnsWithEnergy() {
        const closestStructure = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: structure =>
                (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (closestStructure) {
            this.transferTo(closestStructure);

            if (this.pos.isNearTo(closestStructure)) {
                const secondClosestStructure = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: structure =>
                        (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                        structure.id != closestStructure.id
                });

                if (secondClosestStructure) this.travelTo(secondClosestStructure);
            }
        }
    }

    @AddToPrototype
    movedLastTick() {
        if (!this.memory.previousPos) return true;

        return this.pos.x !== this.memory.previousPos.x || this.pos.y !== this.memory.previousPos.y;
    }

    @AddToPrototype
    isHome() {
        return this.room.name === this.memory.home;
    }

    @AddToPrototype
    isInAssignedRoom() {
        if (!this.memory.assignedRoom) return true;

        return this.room.name === this.memory.assignedRoom;
    }

    @AddToPrototype
    travelToHome() {
        if (this.isHome()) {
            return;
        }

        this.travelTo(new RoomPosition(25, 25, this.memory.home), {range: 20});
    }

    @AddToPrototype
    travelToAssignedRoom() {
        if (!this.memory.assignedRoom || this.isInAssignedRoom()) {
            return;
        }

        this.travelTo(new RoomPosition(25, 25, this.memory.assignedRoom), {range: 20});
    }
}

function AddToPrototype(target: any, methodName: string, descriptor: PropertyDescriptor) {
    // @ts-ignore
    Creep.prototype[methodName] = function (...args: any[]) {
        return descriptor.value.apply(this, args);
    };
}
