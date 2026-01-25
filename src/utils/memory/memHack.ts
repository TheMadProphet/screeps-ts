// Source: https://github.com/The-International-Screeps-Bot/The-International-Open-Source/blob/Main/src/other/memHack.ts

/**
 * Ripped from https://github.com/AlinaNova21/ZeSwarm/
 * Organized by Carson Burke and xTwisteDx
 *
 * Usage:
 * Before the loop, import memHack
 * At start of loop(), run memHack.run()
 */

declare global {
    interface RawMemory {
        _parsed: Memory;
    }
}

class MemHack {
    memory: Memory | undefined;

    constructor() {
        this.memory = Memory;
        this.memory = RawMemory._parsed;
    }

    run() {
        // @ts-ignore
        delete global.Memory;
        // @ts-ignore
        global.Memory = this.memory;
        // @ts-ignore
        RawMemory._parsed = this.memory;
    }
}

export const memHack = new MemHack();
