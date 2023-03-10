import {CreepRole} from "../constants";
import {WorkerTask} from "../creep/workerOrganizer";
import Body from "./body";

export {};

declare global {
    interface StructureSpawn {
        creepsByRole: {
            [role in CreepRole]: Creep[];
        };

        workersByTask: {
            [task in WorkerTask]: Creep[];
        };

        automate(): void;

        spawn(request: CreepSpawnRequest): ScreepsReturnCode;

        displayVisuals(): void;

        canBeUsedAsStorage(): boolean;
    }

    interface SpawnMemory {
        hasEnoughEnergy: boolean;
        wantsToSpawn: string;
    }

    interface CreepSpawnRequest {
        body: Body;
        memory: Omit<CreepMemory, "home">;
    }

    interface RoleSpawner {
        spawn: (spawner: StructureSpawn) => void;
    }
}
