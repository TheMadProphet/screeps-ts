declare global {
    interface RoomMemory {
        targetDefenseHits?: number;
        limitWorker?: number;
    }
}

class Commands {
    public setDefenseHits(roomName: string, hits: number) {
        const room = Game.rooms[roomName];
        if (!room) return `Room ${roomName} not found`;

        room.memory.targetDefenseHits = hits;
        return `Set target defense hits for room ${roomName} to ${hits}`;
    }

    public setWorkerLimit(roomName: string, limit: number) {
        const room = Game.rooms[roomName];
        if (!room) return `Room ${roomName} not found`;

        room.memory.limitWorker = limit;
        return `Set worker limit for room ${roomName} to ${limit}`;
    }

    public resetAll(roomName: string) {
        const room = Game.rooms[roomName];
        if (!room) return `Room ${roomName} not found`;

        delete room.memory.targetDefenseHits;
        delete room.memory.limitWorker;
        return `Reset all commands for room ${roomName}`;
    }

    // Show active commands for a room
    public show(roomName: string) {
        const room = Game.rooms[roomName];
        if (!room) return `Room ${roomName} not found`;

        const defenseHits = room.memory.targetDefenseHits ?? "not set";
        const workerLimit = room.memory.limitWorker ?? "not set";

        return `Commands for room ${roomName}:\n- setDefenseHits: ${defenseHits}\n- setWorkerLimit: ${workerLimit}`;
    }
}

const commands = new Commands();
export default commands;

// @ts-ignore
global.commands = commands;
