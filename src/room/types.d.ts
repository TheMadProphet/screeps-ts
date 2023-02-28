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

    type Sources = Record<Id<Source>, SourceMemory>;

    interface RoomMemory {
        sources: Sources;
        remoteSources?: Record<string, Sources>;
        hasRoadAroundSpawn?: boolean;
        hasRoadToController?: boolean;
        ringsize?: number;
    }

    interface SourceMemory {
        id: Id<Source>;
        roomName: string;
        spaceAvailable: number;
        distanceToSpawn: number;
        assignedMiners: Id<Creep>[];
    }
}
