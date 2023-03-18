import Body from "./body";

export {};

declare global {
    interface StructureSpawn {
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
