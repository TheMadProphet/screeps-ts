import Body from "../body";
import {FILLER} from "../../constants";

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.fillersAreEnabled()) {
            const fillers = spawner.room.creepsByRole[FILLER];
            const maxFillers = 1;

            if (!fillers || !fillers.length || fillers.length < maxFillers) {
                spawner.spawn({
                    body: new Body(spawner).addParts([CARRY, CARRY, MOVE], 7),
                    memory: {
                        role: FILLER
                    }
                });
            }
        }
    }
};

export default fillerSpawner;
