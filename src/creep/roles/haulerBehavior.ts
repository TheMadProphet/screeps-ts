interface HaulerBehavior extends RoleBehavior {
    moveNearSource(creep: Creep, source: Source): void;

    pickupEnergyNearSource(creep: Creep, source: Source): void;
}

const haulerBehavior: HaulerBehavior = {
    run: function (creep: Creep) {
        const source = Game.getObjectById(creep.memory.assignedSource ?? ("" as Id<Source>)) as Source;
        if (!source) {
            creep.say("⚠");
            return;
        }

        if (creep.store.getUsedCapacity() > 0) {
            creep.fillSpawnsWithEnergy();
        } else {
            if (!creep.pos.inRangeTo(source, 2)) {
                this.moveNearSource(creep, source);
            } else {
                this.pickupEnergyNearSource(creep, source);
            }
        }
    },

    moveNearSource(creep: Creep, source: Source) {
        const pathFromSpawn = creep.room.memory!.sources[source.id].pathFromSpawn;

        const moveByPathStatus = creep.moveByPath(pathFromSpawn);
        if (moveByPathStatus === OK) {
            if (creep.movedLastTick()) {
                creep.say("➡");
            } else {
                const currentStepIndex = pathFromSpawn.findIndex(it => it.x === creep.pos.x && it.y === creep.pos.y);
                if (currentStepIndex === pathFromSpawn.length - 1) return;
                const nextStep = pathFromSpawn[currentStepIndex + 1];
                if (stepIsNotWalkable(nextStep, creep.room)) {
                    creep.room.memory.sources[source.id].pathFromSpawn = creep.room.spawn.pos.findPathTo(source, {
                        ignoreCreeps: true
                    });
                    creep.say("⛔");
                }
            }
        } else if (moveByPathStatus === ERR_NOT_FOUND) {
            creep.say("↪️");
            creep.moveTo(pathFromSpawn[0].x, pathFromSpawn[0].y);
        }
    },

    pickupEnergyNearSource(creep: Creep, source: Source) {
        const droppedEnergies = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === RESOURCE_ENERGY
        });

        if (droppedEnergies[0] && creep.pickup(droppedEnergies[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(droppedEnergies[0], {visualizePathStyle: {stroke: "#ffaa00"}});
        }
    }
};

function stepIsNotWalkable(step: PathStep, room: Room) {
    const objectsAtNextStep = room.lookForAt(LOOK_STRUCTURES, step.x, step.y);
    const structureOnNextStep = objectsAtNextStep.some(
        obj => obj.structureType !== STRUCTURE_ROAD && obj.structureType !== STRUCTURE_CONTAINER
    );
    const constructionsAtNextStep = room.lookForAt(LOOK_CONSTRUCTION_SITES, step.x, step.y);

    return structureOnNextStep || constructionsAtNextStep.length;
}

export default haulerBehavior;
