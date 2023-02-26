export const MINER = "Miner";
export const HAULER = "Hauler";
export const WORKER = "Worker";
export const FILLER = "Filler";
export const SCOUT = "Scout";
export const RESERVER = "Reserver";

export const roles = [MINER, HAULER, WORKER, FILLER, SCOUT, RESERVER] as const;

export type CreepRole = (typeof roles)[number];
