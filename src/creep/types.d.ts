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
    }

    interface CreepMemory {
        role: CreepRole;
        task?: string;
        room?: string;
        working?: boolean;
        assignedSource?: Id<Source>;
    }

    interface RoleBehavior {
        run(creep: Creep): void;
    }
}
