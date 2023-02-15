import Body from "../body";
import {BUILDER} from "../../constants";

const builderSpawner: RoleSpawner = {
    spawn(spawner: StructureSpawn) {
        if (spawner.room.constructionSites.length) {
            const builders = spawner.creepsByRole[BUILDER];
            const maxBuilders = 3;
            if (!builders || !builders.length || builders.length < maxBuilders) {
                const body = new Body(spawner).addParts([WORK, CARRY, MOVE, MOVE], 5);

                spawner.spawn({
                    parts: body.getParts(),
                    memory: {
                        role: BUILDER
                    }
                });

                return true;
            }
        }

        return false;
    }
};

export default builderSpawner;
