import roomScanner from "../roomScanner";

class HaulerBehavior implements RoleBehavior {
    run(creep: Creep) {
        const source = Game.getObjectById(creep.memory.assignedSource ?? ("" as Id<Source>));
        const sourceMemory = this.getSourceMemory(creep, source);
        if (!source || !sourceMemory) {
            creep.say("⚠");
            return;
        }

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) creep.memory.working = false;
        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) creep.memory.working = true;

        if (creep.memory.working) {
            if (creep.memory.home !== creep.room.name) {
                this.moveAlongSourceRoute(creep, sourceMemory, sourceMemory.pathToSpawn);
            } else {
                creep.fillSpawnsWithEnergy();
            }
        } else {
            if (creep.pos.inRangeTo(source, 2)) {
                this.pickupEnergyNearSource(creep, source);
            } else {
                this.moveAlongSourceRoute(creep, sourceMemory, sourceMemory.pathFromSpawn);
            }
        }
    }

    moveAlongSourceRoute(creep: Creep, source: SourceMemory, route: PathStep[] | RoomPosition[]) {
        const home = Game.rooms[creep.memory.home];
        const currentStepIndex = route.findIndex(it => it.x === creep.pos.x && it.y === creep.pos.y);
        if (currentStepIndex === -1) {
            creep.say("↪️");
            creep.moveTo(route[0].x, route[0].y);
        } else {
            const nextStep = route[currentStepIndex + 1];
            if (stepIsNotWalkable(nextStep, creep.room)) {
                roomScanner.generateNewPathToSpawn(source, home);
                creep.say("⛔");
            } else {
                const direction = isPathStep(nextStep)
                    ? nextStep.direction
                    : creep.pos.getDirectionTo(new RoomPosition(nextStep.x, nextStep.y, creep.room.name));
                const moveStatus = creep.move(direction);
                creep.say(`➡ ${moveStatus}`);
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
            creep.moveTo(droppedEnergies[0], {visualizePathStyle: {stroke: "#ffaa00"}});
        }
    }

    private getSourceMemory(creep: Creep, source: Source | null) {
        if (!source) return null;

        const home = Game.rooms[creep.memory.home];

        const sourceMemory = home.memory!.sources[source.id];
        if (sourceMemory) return sourceMemory;

        if (!home.memory.remoteSources) return null;

        const remoteSourceMemory = home.memory.remoteSources[source.room.name][source.id];
        if (remoteSourceMemory) return remoteSourceMemory;

        return null;
    }
}

function stepIsNotWalkable(step: PathStep | RoomPosition, room: Room) {
    const objectsAtNextStep = room.lookForAt(LOOK_STRUCTURES, step.x, step.y);
    const structureOnNextStep = objectsAtNextStep.some(
        obj => obj.structureType !== STRUCTURE_ROAD && obj.structureType !== STRUCTURE_CONTAINER
    );
    const constructionsAtNextStep = room.lookForAt(LOOK_CONSTRUCTION_SITES, step.x, step.y);

    return structureOnNextStep || constructionsAtNextStep.length;
}

function isPathStep(variable: RoomPosition | PathStep): variable is PathStep {
    const step = variable as PathStep;
    return Boolean(step.dx && step.dy);
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
