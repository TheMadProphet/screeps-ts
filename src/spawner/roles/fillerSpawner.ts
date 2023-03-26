import Body from "../body";
import {FILLER} from "../../constants";

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.fillersAreEnabled()) {
            const filler = spawner.room.creepsByRole[FILLER][0];

            if (!filler || (filler.ticksToLive && filler.ticksToLive < 100)) {
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
