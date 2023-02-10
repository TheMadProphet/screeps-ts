import Body from "./body";

declare global {
    interface StructureSpawn {
        creepsByRole: Record<string, Creep[]>;

        automate(): void;

        spawn(body: Body, memory: CreepMemory): ScreepsReturnCode;

        displayVisuals(): void;

        canBeUsedAsStorage(): boolean;
    }

    interface SpawnMemory {
        hasEnoughEnergy: boolean;
        wantsToSpawn: string;
    }

    interface RoleSpawner {
        spawn: (spawner: StructureSpawn) => ScreepsReturnCode;
    }
}
