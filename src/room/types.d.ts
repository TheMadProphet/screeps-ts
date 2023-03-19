import {CreepRole} from "../constants";
import {WorkerTask} from "../creep/workerOrganizer";

export {};

declare global {
    interface Room {
        spawn: StructureSpawn;
        availableExtension: number;
        creepsByRole: {
            [role in CreepRole]: Creep[];
        };
        workersByTask: {
            [task in WorkerTask]: Creep[];
        };

        automate(): void;

        buildRoad(from: RoomPosition, to: RoomPosition): void;

        buildBiDirectionalRoad(pos1: RoomPosition, pos2: RoomPosition): void;

        fillersAreEnabled(): boolean;

        hasEnergyEmergency(): boolean;

        getColonies(): string[];

        isBeingReserved(): boolean;
    }

    interface RoomMemory {
        sources: Id<Source>[];
        hasRoadAroundSpawn?: boolean;
        hasRoadToController?: boolean;
        ringsize?: number;
    }
}
