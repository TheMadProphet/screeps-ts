import {CreepRole} from "../constants";

declare global {
    interface Creep {
        runRole(): void;

        idle(): void;

        withdrawEnergy(includeSpawn?: boolean): void;

        findEnergyRepository(includeSpawn?: boolean): Structure | null;

        harvestFrom(target: Source): ReturnType<typeof Creep.prototype.harvest>;

        withdrawFrom(target: Structure, resource?: ResourceConstant): ReturnType<typeof Creep.prototype.withdraw>;

        pickupResource(resource: Resource): ReturnType<typeof Creep.prototype.pickup>;

        transferTo(target: Structure, resource?: ResourceConstant): void;

        fillSpawnsWithEnergy(): void;

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
