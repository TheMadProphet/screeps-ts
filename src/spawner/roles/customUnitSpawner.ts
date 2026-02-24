import Body from "../body";
import {CUSTOM_UNIT} from "../../constants";

const AMOUNT = 1;

class CustomUnitSpawner implements RoleSpawner {
    spawn(spawner: StructureSpawn) {
        const flag = this.getFlag(spawner.room);
        if (!flag) return;

        const activeUnits = spawner.room.creepsByRole[CUSTOM_UNIT];
        const isAboutToDie = activeUnits.some(it => it.ticksToLive !== undefined && it.ticksToLive! < 100);
        if (activeUnits.length < AMOUNT || (isAboutToDie && activeUnits.length === AMOUNT)) {
            spawner.spawn({
                body: new Body(spawner).addParts([WORK, WORK, MOVE], 25),
                memory: {
                    role: CUSTOM_UNIT
                }
            });
        }
    }

    getFlag(room: Room) {
        return Game.flags[`custom-${room.name}`];
    }
}

const customUnitSpawner = new CustomUnitSpawner();
export default customUnitSpawner;
