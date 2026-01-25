export const MINER = "Miner";
export const HAULER = "Hauler";
export const WORKER = "Worker";
export const FILLER = "Filler";
export const SCOUT = "Scout";
export const RESERVER = "Reserver";
export const EMERGENCY_UNIT = "Emergency";
export const DEFENDER = "Defender";
export const EXTRACTOR = "Extractor";

export const roles = [MINER, HAULER, WORKER, FILLER, SCOUT, RESERVER, EMERGENCY_UNIT, DEFENDER, EXTRACTOR] as const;

export type CreepRole = (typeof roles)[number];
