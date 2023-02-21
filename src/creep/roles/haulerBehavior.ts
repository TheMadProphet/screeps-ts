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

    moveAlongSourceRoute(creep: Creep, source: SourceMemory, route: RoomPosition[]) {
        const home = Game.rooms[creep.memory.home];
        if (route.length === 0) {
            roomScanner.generateNewPathToSpawn(source, home);
        }

        const currentStepIndex = route.findIndex(it => it.x === creep.pos.x && it.y === creep.pos.y);
        if (currentStepIndex === -1) {
            const routeStart = route[0];
            const routeEnd = route[route.length - 1];

            let moveStatus: string | number = "?";
            if (routeStart.roomName === creep.room.name) {
                moveStatus = creep.moveTo(routeStart.x, routeStart.y);
            } else if (routeEnd.roomName === creep.room.name) {
                moveStatus = creep.moveTo(routeEnd.x, routeEnd.y);
            }

            if (moveStatus === ERR_NO_PATH) {
                roomScanner.generateNewPathToSpawn(source, home);
            }

            creep.say(`↪️${moveStatus}`);
        } else {
            const nextStep = route[currentStepIndex + 1];
            if (stepIsNotWalkable(nextStep, creep.room)) {
                roomScanner.generateNewPathToSpawn(source, home);
            } else {
                const direction = creep.pos.getDirectionTo(new RoomPosition(nextStep.x, nextStep.y, creep.room.name));
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

const walkableStructures: StructureConstant[] = [STRUCTURE_ROAD, STRUCTURE_CONTAINER, STRUCTURE_RAMPART];

function stepIsNotWalkable(step: PathStep | RoomPosition, room: Room) {
    let isNotWalkable = room
        .lookForAt(LOOK_STRUCTURES, step.x, step.y)
        .some(it => !walkableStructures.includes(it.structureType));

    if (isNotWalkable) return true;

    isNotWalkable = room
        .lookForAt(LOOK_CONSTRUCTION_SITES, step.x, step.y)
        .some(it => !walkableStructures.includes(it.structureType));

    return isNotWalkable;
}

const haulerBehavior = new HaulerBehavior();
export default haulerBehavior;
