import Body from "../body";
import {HAULER, MINER} from "../../constants";

class HaulerSpawner implements RoleSpawner {
    public spawn(spawner: StructureSpawn) {
        const room = spawner.room;
        if (room.creepsByRole[MINER].length === 0) return;

        for (const sourceId of room.memory.sources) {
            if (this.spawnHaulerForSource(spawner, sourceId, room.name) === OK) return;
        }

        for (const colony of room.getAllColonies()) {
            if (Memory.rooms[colony].invaderCount ?? 0 > 0) continue;

            for (const sourceId of Memory.rooms[colony].sources) {
                if (this.spawnHaulerForSource(spawner, sourceId, colony, true) === OK) return;
            }
        }
    }

    private spawnHaulerForSource(
        spawner: StructureSpawn,
        sourceId: Id<Source>,
        sourceRoomName: string,
        isRemote = false
    ): OK | false {
        const sourceMemory = Memory.sources[sourceId];
        const totalWorkParts = this.getAssignedWorkPartsForSource(sourceId, spawner.room);
        const requiredCarryParts = this.calculateRequiredCarryParts(sourceMemory, totalWorkParts);

        const totalCarryParts = this.getAssignedCarryPartsForSource(sourceId, spawner.room);
        if (totalCarryParts < requiredCarryParts) {
            let haulerBody = this.getHaulerBody(spawner, requiredCarryParts, sourceMemory.hasRoad, isRemote);

            if (haulerBody.getPartCount(CARRY) < requiredCarryParts) {
                const maxCarryPerCreep = haulerBody.getPartCount(CARRY);
                const minCreepCount = Math.ceil(requiredCarryParts / maxCarryPerCreep);
                const partsPerCreep = Math.ceil(requiredCarryParts / minCreepCount);

                haulerBody = this.getHaulerBody(spawner, partsPerCreep, sourceMemory.hasRoad, isRemote);
            }

            spawner.spawn({
                body: haulerBody,
                memory: {role: HAULER, assignedSource: sourceId, assignedRoom: sourceRoomName}
            });

            return OK;
        }

        return false;
    }

    private getHaulerBody(
        spawner: StructureSpawn,
        carryPartsRequired: number,
        hasRoad: boolean | undefined,
        isRemote: boolean
    ): Body {
        if (hasRoad) {
            return new Body(spawner)
                .addParts(isRemote ? [WORK, CARRY, MOVE] : [])
                .addParts([CARRY, CARRY, MOVE], Math.ceil(carryPartsRequired / 2));
        }

        return new Body(spawner).addParts([CARRY, MOVE], carryPartsRequired);
    }

    private getAssignedCarryPartsForSource(sourceId: Id<Source>, room: Room): number {
        const assignedHaulers = room.creepsByRole[HAULER].filter(hauler => hauler.memory.assignedSource === sourceId);

        return _.sum(assignedHaulers, miner => miner.getActiveBodyparts(CARRY));
    }

    private getAssignedWorkPartsForSource(sourceId: Id<Source>, room: Room): number {
        const assignedMiners = room.creepsByRole[MINER].filter(miner => miner.memory.assignedSource === sourceId);

        return _.sum(assignedMiners, miner => miner.getActiveBodyparts(WORK));
    }

    private calculateRequiredCarryParts(sourceMemory: SourceMemory, minerWorkParts: number): number {
        const energyGeneratedByWorkersPerLifetime = Math.min(minerWorkParts, 5) * 2 * CREEP_LIFE_TIME;
        const pathCost = sourceMemory.pathCost / 2; // TODO: dont need to divide if using ignoreRoads option
        const biRoutePerLifetime = CREEP_LIFE_TIME / pathCost / 2;

        const totalCapacityRequired = energyGeneratedByWorkersPerLifetime / biRoutePerLifetime;
        return totalCapacityRequired / CARRY_CAPACITY;
    }
}

const haulerSpawner = new HaulerSpawner();
export default haulerSpawner;
