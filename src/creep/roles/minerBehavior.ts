class MinerBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
        }

        if (creep.memory.assignedRoom != creep.room.name) {
            creep.travelToAssignedRoom();
        } else {
            const source = Game.getObjectById(creep.memory.assignedSource);
            if (source) {
                this.mineSource(creep, source);
            }
        }
    }

    private mineSource(creep: Creep, source: Source) {
        if (creep.pos.isNearTo(source)) {
            if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
                this.maintainInfrastructure(creep, source);
                creep.say("🕑");
            }
        } else {
            if (source.container) creep.travelTo(source.container);
            else creep.travelTo(source, {range: 1});
        }
    }

    private maintainInfrastructure(creep: Creep, source: Source) {
        if (!source.container) return;

        if (creep.store.getUsedCapacity() === 0) {
            creep.withdrawFrom(source.container);
        } else if (source.container.hits / source.container.hitsMax < 0.95) {
            creep.repair(source.container);
        } else {
            const damagedRoads = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: it => it.structureType === STRUCTURE_ROAD && it.hitsMax - it.hits >= 500
            });

            if (damagedRoads.length) {
                creep.repair(damagedRoads[0]);
            }
        }
    }
}

const minerBehavior = new MinerBehavior();
export default minerBehavior;
