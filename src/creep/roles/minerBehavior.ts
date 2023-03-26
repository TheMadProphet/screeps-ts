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
                this.maintainContainer(creep, source);
                this.mineSource(creep, source);
            }
        }
    }

    private mineSource(creep: Creep, source: Source) {
        if (source.container) {
            if (creep.pos.isEqualTo(source.container.pos)) {
                creep.harvest(source);
            } else {
                creep.travelTo(source.container);
            }
        } else {
            if (creep.harvestFrom(source) === ERR_NOT_ENOUGH_RESOURCES) {
                creep.say("🕑");
            }
        }
    }

    private maintainContainer(creep: Creep, source: Source) {
        if (source.container && creep.store.getUsedCapacity() > 0) {
            creep.repair(source.container);
        }
    }
}

const minerBehavior = new MinerBehavior();
export default minerBehavior;
