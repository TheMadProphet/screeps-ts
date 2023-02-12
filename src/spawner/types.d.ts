export {};

declare global {
    interface StructureSpawn {
        spawnQueue: CreepSpawnRequest[];
        creepsByRole: {
            [role in CreepRole]: Creep[];
        };

        automate(): void;

        spawn(request: CreepSpawnRequest): ScreepsReturnCode;

        addQueue(request: CreepSpawnRequest, count?: number): void;

        displayVisuals(): void;

        canBeUsedAsStorage(): boolean;
    }

    interface SpawnMemory {
        hasEnoughEnergy: boolean;
        wantsToSpawn: string;
        spawnQueue: CreepSpawnRequest[];
    }

    interface CreepSpawnRequest {
        parts: BodyPartConstant[];
        memory: CreepMemory;
    }

    interface RoleSpawner {
        spawn: (spawner: StructureSpawn) => void;
    }
}
