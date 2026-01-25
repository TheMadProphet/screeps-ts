import Body from "../body";
import {EXTRACTOR, MINERAL_HAULER} from "../../constants";

class MineralHaulerSpawner implements RoleSpawner {
    public spawn(spawner: StructureSpawn): OK | void {
        const room = spawner.room;
        const mineralId = room.memory.mineral;
        if (!mineralId) return;

        const mineral = Game.getObjectById(mineralId);
        const mineralMemory = Memory.minerals[mineralId];
        if (!mineral) return;
        if (mineral.mineralAmount < 1) return;
        if (!mineralMemory?.containerId || !mineralMemory?.extractorId) return;

        const assignedExtractors = room.creepsByRole[EXTRACTOR].filter(
            extractor => extractor.memory.assignedMineral === mineralId
        );
        if (assignedExtractors.length < 1) return;

        const assignedHaulers = room.creepsByRole[MINERAL_HAULER].filter(
            hauler => hauler.memory.assignedMineral === mineralId
        );
        if (assignedHaulers.length > 0) return;

        // Calculate required carry parts for mineral hauling
        const requiredCarryParts = this.calculateMineralCarryParts(mineralMemory);
        const haulerBody = this.getHaulerBody(spawner, requiredCarryParts, mineralMemory.hasRoad);

        spawner.spawn({
            body: haulerBody,
            memory: {role: MINERAL_HAULER, assignedMineral: mineralId, assignedRoom: room.name}
        });

        return OK;
    }

    private getHaulerBody(spawner: StructureSpawn, carryPartsRequired: number, hasRoad: boolean | undefined): Body {
        if (hasRoad) {
            return new Body(spawner).addParts([CARRY, CARRY, MOVE], Math.ceil(carryPartsRequired / 2));
        }

        return new Body(spawner).addParts([CARRY, MOVE], carryPartsRequired);
    }

    private calculateMineralCarryParts(mineralMemory: MineralMemory): number {
        // Extractors have a 5-tick cooldown, so average output is ~1 mineral per tick per WORK part
        // With typical 10-20 WORK parts, that's 10-20 minerals/tick average
        // However, the extractor spawner uses up to 20 WORK parts (10 sets of [WORK, WORK, MOVE])
        // Actual rate: 1 mineral per WORK per 6 ticks (5 cooldown + 1 harvest) = ~3.3 minerals/tick for 20 WORK
        const mineralsGeneratedPerTick = 3.3;
        const pathCost = mineralMemory.pathCost / 2;
        const roundTripTicks = pathCost * 2;

        // Capacity needed = minerals generated during round trip
        const capacityNeeded = mineralsGeneratedPerTick * roundTripTicks;
        return Math.ceil(capacityNeeded / CARRY_CAPACITY);
    }
}

const mineralHaulerSpawner = new MineralHaulerSpawner();
export default mineralHaulerSpawner;
