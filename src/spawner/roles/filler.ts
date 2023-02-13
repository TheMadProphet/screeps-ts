import Body from "../body";
import {FILLER} from "../../constants";

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.fillersAreEnabled()) {
            const fillers = spawner.creepsByRole[FILLER];
            const maxFillers = 1;

            if (!fillers || !fillers.length || fillers.length < maxFillers) {
                const body = new Body(spawner).addParts([CARRY, CARRY, MOVE], 7);

                spawner.spawn({
                    parts: body.getParts(),
                    memory: {
                        role: FILLER
                    }
                });

                return true;
            }
        }

        return false;
    }
};

export default fillerSpawner;
