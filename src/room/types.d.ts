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
        pathFromSpawn: RoomPosition[];
        pathToSpawn: RoomPosition[];
        assignedMiners: Id<Creep>[];
    }
}
