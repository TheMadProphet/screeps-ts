import roomDefense from "../../creep/roomDefense";
import Body from "../body";
import {DEFENDER} from "../../constants";

const defenderSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomDefense.needsDefenseCreep(spawner.room)) {
            if (spawner.room.energyCapacityAvailable > 1500) {
                spawner.spawn({
                    body: new Body(spawner).addParts([RANGED_ATTACK, MOVE], 10),
                    memory: {
                        role: DEFENDER
                    }
                });
            } else {
                spawner.spawn({
                    body: new Body(spawner).addParts([ATTACK, MOVE], 10),
                    memory: {
                        role: DEFENDER
                    }
                });
            }
        }
    }
};

export default defenderSpawner;
