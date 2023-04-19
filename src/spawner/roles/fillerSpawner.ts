import Body from "../body";
import {FILLER} from "../../constants";

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.fillersAreEnabled()) {
            const fillers = spawner.room.creepsByRole[FILLER];
            if (fillers.length < 2) {
                spawner.spawn({
                    body: new Body(spawner).addParts([CARRY, CARRY, MOVE], 10),
                    memory: {
                        role: FILLER
                    }
                });
            }
        }
    }
};

export default fillerSpawner;
