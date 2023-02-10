export {};

type ROLE_HARVESTER = "Harvester";
type ROLE_UPGRADER = "Upgrader";
type ROLE_BUILDER = "Builder";
type ROLE_HANDYMAN = "Handyman";
type ROLE_FILLER = "Filler";

declare global {
    type CreepRole = ROLE_HARVESTER | ROLE_UPGRADER | ROLE_BUILDER | ROLE_HANDYMAN | ROLE_FILLER;

    const HARVESTER: ROLE_HARVESTER;
    const UPGRADER: ROLE_UPGRADER;
    const BUILDER: ROLE_BUILDER;
    const HANDYMAN: ROLE_HANDYMAN;
    const FILLER: ROLE_FILLER;

    interface CreepMemory {
        role: CreepRole;
        room?: string;
        working?: boolean;
        assignedSource?: Id<Source>;
    }
}
