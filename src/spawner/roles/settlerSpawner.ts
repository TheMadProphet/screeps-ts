import Body from "../body";
import {SETTLER} from "../../constants";
import kingdom from "../../kingdom/kingdom";
import {settlerTasks} from "../../creep/roles/settlerBehavior";

const HAULER_AMOUNT = 2;
const WORKER_AMOUNT = 1;
const CLAIMER_AMOUNT = 1;

const settlerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        const roomToSettle = kingdom.getRoomToSettle(spawner.room);
        if (!roomToSettle) return;

        const settlers = spawner.room.creepsByRole[SETTLER];

        // First spawn haulers
        const haulers = settlers.filter(it => it.memory.settlerTask === settlerTasks.HAUL);
        if (haulers.length < HAULER_AMOUNT) {
            spawner.spawn({
                body: new Body(spawner).addParts([CARRY, MOVE], 25),
                memory: {
                    role: SETTLER,
                    settlerTask: settlerTasks.HAUL,
                    assignedRoom: roomToSettle
                }
            });
            return;
        }

        // Then spawn worker
        const workers = settlers.filter(it => it.memory.settlerTask === settlerTasks.WORK);
        if (workers.length < WORKER_AMOUNT) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 10),
                memory: {
                    role: SETTLER,
                    settlerTask: settlerTasks.WORK,
                    assignedRoom: roomToSettle
                }
            });
            return;
        }

        // Finally spawn claimer
        const claimers = settlers.filter(it => it.memory.settlerTask === settlerTasks.CLAIM);
        const alreadyClaimed = Game.rooms[roomToSettle]?.controller?.my;
        if (claimers.length < CLAIMER_AMOUNT && !alreadyClaimed) {
            spawner.spawn({
                body: new Body(spawner).addParts([CLAIM, MOVE], 1),
                memory: {
                    role: SETTLER,
                    settlerTask: settlerTasks.CLAIM,
                    assignedRoom: roomToSettle
                }
            });
            return;
        }
    }
};

export default settlerSpawner;
