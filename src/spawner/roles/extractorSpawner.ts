import Body from "../body";
import {EXTRACTOR} from "../../constants";

class ExtractorSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const mineralId = spawner.room.memory.mineral;
        const mineral = mineralId ? Game.getObjectById<Mineral>(mineralId) : null;
        if (!mineral || mineral.mineralAmount < 1) return;
        if (!mineral.memory.extractorId) return;

        const assignedExtractors = spawner.room.creepsByRole[EXTRACTOR].filter(
            extractor => extractor.memory.assignedMineral === mineral.id
        );
        if (assignedExtractors.length < 1) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, WORK, MOVE], 10),
                memory: {role: EXTRACTOR, assignedMineral: mineral.id as Id<Mineral>, assignedRoom: spawner.room.name}
            });

            return;
        }
    }
}

const extractorSpawner = new ExtractorSpawner();
export default extractorSpawner;
