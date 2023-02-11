export {};

declare global {
    interface Room {
        spawn: StructureSpawn;
        availableExtension: number;
        constructionSites: ConstructionSite[];
        rawSources: Source[];

        automate(): void;

        buildRoad(from: RoomPosition, to: RoomPosition): void;

        buildBiDirectionalRoad(pos1: RoomPosition, pos2: RoomPosition): void;

        fillersAreEnabled(): boolean;

        hasEnergyEmergency(): boolean;
    }

    interface RoomMemory {
        sources: Record<Id<Source>, SourceMemory>;
        hasRoadAroundSpawn?: boolean;
        hasRoadToController?: boolean;
        ringsize?: number;
    }

    interface SourceMemory {
        hasRoad?: boolean;
        maxWorkerCount?: number;
        distanceToSpawn?: number;
        assignedWorkers: Id<Creep>[];
    }
}
