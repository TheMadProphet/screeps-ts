export const HARVESTER = "Harvester";
export const MINER = "Miner";
export const HAULER = "Hauler";
export const UPGRADER = "Upgrader";
export const BUILDER = "Builder";
export const HANDYMAN = "Handyman";
export const FILLER = "Filler";

export const roles = [HARVESTER, MINER, HAULER, UPGRADER, BUILDER, HANDYMAN, FILLER] as const;

export type CreepRole = (typeof roles)[number];
