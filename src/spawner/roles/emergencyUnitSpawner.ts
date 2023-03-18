import Body from "../body";
import {EMERGENCY_UNIT, HAULER, MINER} from "../../constants";

class EmergencyUnitSpawner implements RoleSpawner {
    readonly EMERGENCY_UNIT_COUNT = 3;

    spawn(spawner: StructureSpawn) {
        if (this.roomHasEmergency(spawner.room)) {
            const emergencyUnitCount = spawner.room.creepsByRole[EMERGENCY_UNIT].length;
            if (emergencyUnitCount < this.EMERGENCY_UNIT_COUNT) {
                spawner.spawn({
                    body: new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE]),
                    memory: {
                        role: EMERGENCY_UNIT
                    }
                });
            }
        }
    }

    roomHasEmergency(room: Room) {
        return (
            room.energyCapacityAvailable > 300 &&
            (room.creepsByRole[MINER].length < 1 || room.creepsByRole[HAULER].length < 1)
        );
    }
}

const emergencyUnitSpawner = new EmergencyUnitSpawner();
export default emergencyUnitSpawner;
