import Body from "../body";
import {FILLER} from "../../constants";

const FILLER_AMOUNT = 1;

const fillerSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.fillersAreEnabled()) {
            const fillers = spawner.room.creepsByRole[FILLER];
            const isFillerAboutToDie = fillers.some(
                filler => filler.ticksToLive !== undefined && filler.ticksToLive! < 100
            );
            if (fillers.length < FILLER_AMOUNT || isFillerAboutToDie) {
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
