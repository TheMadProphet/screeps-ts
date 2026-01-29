import roomScanner from "../creep/roomScanner";

declare global {
    interface Memory {
        kingdom: KingdomMemory;
    }

    interface KingdomMemory {
        rooms: string[];
        roomColonies: {[roomName: string]: string[]};
    }
}

const COLONY_LIMIT = 2;

class Kingdom {
    public tick() {
        this.initialize();

        for (const roomName of Memory.kingdom.rooms) {
            const room = Game.rooms[roomName];
            if (!room) continue;

            this.establishColonies(room);
        }
    }

    public getRoomToSettle(room: Room): string | undefined {
        const flagName = `settle_from_${room.name}`;
        const flag = Game.flags[flagName];
        return flag?.pos?.roomName;
    }

    private initialize() {
        if (Memory.kingdom) return;

        Memory.kingdom = {
            rooms: [],
            roomColonies: {}
        };

        if (Memory.kingdom.rooms.length === 0) {
            for (const room of Object.values(Game.rooms)) {
                if (room.controller?.my) {
                    Memory.kingdom.rooms.push(room.name);
                    Memory.kingdom.roomColonies[room.name] = room.getAllColonies();
                }
            }
        }
    }

    private establishColonies(room: Room) {
        if (room.memory.colonies) return;
        if (room.controller!.level < 2) return;
        if (!roomScanner.isNeighborsScanComplete(room)) return;

        const vacantRooms = room.memory.neighborsInfo!.vacantRooms;
        room.memory.colonies = [...vacantRooms]
            .sort((a, b) => this.colonyScore(b) - this.colonyScore(a))
            .slice(0, COLONY_LIMIT);
    }

    private colonyScore(roomName: string): number {
        const sources = Memory.rooms[roomName]?.sources ?? [];
        if (sources.length === 0) return -Infinity;

        const avgCost = _.sum(sources.map(id => Memory.sources[id]?.pathCost ?? Infinity)) / sources.length;

        return sources.length / avgCost;
    }
}

const kingdom = new Kingdom();
export default kingdom;
