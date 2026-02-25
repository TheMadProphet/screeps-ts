class MinerBehavior implements RoleBehavior {
    run(creep: Creep) {
        if (!creep.memory.assignedSource) {
            creep.say("⚠");
            return;
        }

        const source = Game.getObjectById(creep.memory.assignedSource);
        if (source) {
            this.mineSource(creep, source);
        } else {
            creep.travelToAssignedRoom();
        }
    }

    private mineSource(creep: Creep, source: Source) {
        if (source.link && source.memory.linkMiningPos) {
            return this.mineSourceWithLink(creep, source, source.link, source.memory.linkMiningPos);
        }

        if (source.container && !creep.pos.isEqualTo(source.container)) {
            creep.travelTo(source.container, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        } else if (!creep.pos.isNearTo(source)) {
            creep.travelTo(source, {maxRooms: creep.isInAssignedRoom() ? 1 : undefined});
        } else {
            if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
                this.maintainInfrastructure(creep, source);
                creep.say("🕑");
            }
        }
    }

    private maintainInfrastructure(creep: Creep, source: Source) {
        if (!source.container) return;

        if (creep.store.getUsedCapacity() === 0) {
            creep.withdraw(source.container, RESOURCE_ENERGY);
        } else if (source.container.hitsMax - source.container.hits > 1000) {
            creep.repair(source.container);
        } else if (Game.time % 5 === 0) {
            const damagedRoads = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: it => it.structureType === STRUCTURE_ROAD && it.hitsMax - it.hits >= 500
            });

            if (damagedRoads.length) {
                creep.repair(damagedRoads[0]);
            }
        }
    }

    private mineSourceWithLink(creep: Creep, source: Source, link: StructureLink, miningPos: {x: number; y: number}) {
        if (creep.pos.isEqualTo(miningPos.x, miningPos.y)) {
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) creep.transfer(link, RESOURCE_ENERGY);

            if (link.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                creep.say("⚠ Link");
                return;
            }

            if (source.energy > 0) creep.harvest(source);
        } else {
            const miningPosition = source.room.getPositionAt(miningPos.x, miningPos.y);
            if (miningPosition) {
                creep.travelTo(miningPosition);
            } else {
                creep.travelTo(source, {range: 1});
                creep.say("⚠ Pos");
            }
        }
    }
}

const minerBehavior = new MinerBehavior();
export default minerBehavior;
