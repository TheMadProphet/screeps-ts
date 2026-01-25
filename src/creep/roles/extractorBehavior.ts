declare global {
    interface CreepMemory {
        assignedMineral?: Id<Mineral>;
    }
}

class ExtractorBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedMineral) {
            creep.say("⚠");
            return;
        }

        const mineral = Game.getObjectById(creep.memory.assignedMineral);
        if (mineral) {
            this.mineMineral(creep, mineral);
        } else {
            creep.say("❓");
        }
    }

    private mineMineral(creep: Creep, mineral: Mineral) {
        if (mineral.container && !creep.pos.isEqualTo(mineral.container)) {
            creep.travelTo(mineral.container, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        } else if (!creep.pos.isNearTo(mineral)) {
            creep.travelTo(mineral, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        } else if (creep.harvest(mineral) === ERR_NOT_ENOUGH_RESOURCES) {
            creep.say("🕑");
        }
    }
}

const extractorBehavior = new ExtractorBehavior();
export default extractorBehavior;
