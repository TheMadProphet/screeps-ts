export const MINER = "Miner";
export const HAULER = "Hauler";
export const WORKER = "Worker";
export const UPGRADER = "Upgrader";
export const BUILDER = "Builder";
export const HANDYMAN = "Handyman";
export const FILLER = "Filler";
export const SCOUT = "Scout";
export const RESERVER = "Reserver";

export const roles = [MINER, HAULER, WORKER, UPGRADER, BUILDER, HANDYMAN, FILLER, SCOUT, RESERVER] as const;

export type CreepRole = (typeof roles)[number];
