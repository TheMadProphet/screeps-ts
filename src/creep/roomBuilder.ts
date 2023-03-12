declare global {
    interface RoomMemory {
        constructions: SimpleConstructionSite[];
    }
}

interface SimpleConstructionSite {
    id: Id<ConstructionSite>;
    room: string;
    home: string;
    type: BuildableStructureConstant;
}

class RoomBuilder {
    public queue(construction: ConstructionSite, homeName?: string) {
        const home = homeName ? Game.rooms[homeName] : construction.room!;

        if (!home.memory.constructions) home.memory.constructions = [];

        home.memory.constructions.push({
            id: construction.id,
            home: home.name,
            room: construction.room!.name,
            type: construction.structureType
        });
    }

    public getNextConstruction(room: Room): SimpleConstructionSite | null {
        if (!room.memory.constructions || room.memory.constructions.length === 0) return null;

        const construction = room.memory.constructions[0];
        if (Game.constructionSites[construction.id]) {
            return construction;
        } else {
            room.memory.constructions.shift();
            return room.memory.constructions[0] ?? null;
        }
    }
}

const roomBuilder = new RoomBuilder();
export default roomBuilder;
