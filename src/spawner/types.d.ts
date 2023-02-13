import {CreepRole} from "../constants";

export {};

declare global {
    interface StructureSpawn {
        creepsByRole: {
            [role in CreepRole]: Creep[];
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
        parts: BodyPartConstant[];
        memory: CreepMemory;
    }

    interface RoleSpawner {
        spawn: (spawner: StructureSpawn) => boolean;
    }
}
