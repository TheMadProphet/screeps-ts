export {};

declare global {
    interface Room {
        spawn: StructureSpawn;
        availableExtension: number;

        automate(): void;

        buildRoad(from: RoomPosition, to: RoomPosition): void;

        buildBiDirectionalRoad(pos1: RoomPosition, pos2: RoomPosition): void;

        fillersAreEnabled(): boolean;

        hasEnergyEmergency(): boolean;
    }

    interface RoomMemory {
        sources: Id<Source>[];
        remoteSources?: Record<string, Id<Source>[]>;
        hasRoadAroundSpawn?: boolean;
        hasRoadToController?: boolean;
        ringsize?: number;
    }
}
