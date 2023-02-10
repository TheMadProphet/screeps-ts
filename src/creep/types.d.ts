export {};

type ROLE_HARVESTER = "Harvester";
type ROLE_UPGRADER = "Upgrader";
type ROLE_BUILDER = "Builder";
type ROLE_HANDYMAN = "Handyman";
type ROLE_FILLER = "Filler";

declare global {
    interface Creep {
        runRole(): void;

        idle(): void;

        withdrawEnergy(includeSpawn?: boolean): void;

        findEnergyRepository(includeSpawn?: boolean): Structure;

        withdrawFrom(target: Structure, resource?: ResourceConstant): void;

        transferTo(target: Structure, resource?: ResourceConstant): void;

        fillSpawnsWithEnergy(): ScreepsReturnCode;

        fillContainersWithEnergy(): ScreepsReturnCode;
    }

    interface CreepMemory {
        role: CreepRole;
        room?: string;
        working?: boolean;
        assignedSource?: Id<Source>;
    }

    interface RoleBehavior {
        run(creep: Creep): void;
    }

    type CreepRole = ROLE_HARVESTER | ROLE_UPGRADER | ROLE_BUILDER | ROLE_HANDYMAN | ROLE_FILLER;

    const HARVESTER: ROLE_HARVESTER;
    const UPGRADER: ROLE_UPGRADER;
    const BUILDER: ROLE_BUILDER;
    const HANDYMAN: ROLE_HANDYMAN;
    const FILLER: ROLE_FILLER;
}
