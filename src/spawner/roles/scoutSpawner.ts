import Body from "../body";
import {SCOUT} from "../../constants";
import roomScanner from "../../creep/roomScanner";

const scoutSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (roomScanner.needsScoutToScanNeighbors(spawner.room)) {
            spawner.spawn({
                body: new Body(spawner).addParts([MOVE]),
                memory: {
                    role: SCOUT
                }
            });
        }
    }
};

export default scoutSpawner;
