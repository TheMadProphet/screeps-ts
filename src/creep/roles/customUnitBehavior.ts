class CustomUnitBehavior implements RoleBehavior {
    run(creep: Creep) {
        const flag = this.getFlag(creep);
        if (!flag) {
            creep.say("??");
            return;
        }

        if (!creep.pos.isNearTo(flag)) {
            creep.travelTo(flag, {range: 1, ignoreCreeps: creep.room !== flag.room});
        } else {
            const target = flag.pos.lookFor(LOOK_STRUCTURES)[0];
            if (target) {
                creep.dismantle(target);
            } else {
                creep.say("???");
            }
        }
    }

    private getFlag(creep: Creep) {
        return Game.flags[`custom-${creep.memory.home}`];
    }
}

const customUnitBehavior = new CustomUnitBehavior();
export default customUnitBehavior;
