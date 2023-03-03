import {CreepRole} from "../constants";

declare global {
    interface Creep {
        runRole(): void;

        idle(): void;

        withdrawEnergy(includeSpawn?: boolean): void;

        findEnergyRepository(includeSpawn?: boolean): Structure | null;

        withdrawFrom(target: Structure, resource?: ResourceConstant): void;

        transferTo(target: Structure, resource?: ResourceConstant): void;

        fillSpawnsWithEnergy(): ScreepsReturnCode;

        fillContainersWithEnergy(): ScreepsReturnCode;

        isHome(): boolean;

        isInAssignedRoom(): boolean;

        movedLastTick(): boolean;

        moveToAssignedRoom(): void;
    }

    interface CreepMemory {
        role: CreepRole;
        previousPos?: RoomPosition;
        previousFatigue?: number;
        home: string;
        working?: boolean;
        assignedSource?: Id<Source>;
    }

    interface RoleBehavior {
        run(creep: Creep): void;
    }
}
