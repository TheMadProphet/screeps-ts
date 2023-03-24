import {Traveler} from "../../../utils/traveler/traveler";
import {buildRoadAtPositions} from "../helper";

class SourceInfrastructure {
    source: Source;

    constructor(source: Source) {
        this.source = source;
    }

    public build(fromStructure: AnyStructure) {
        this.buildContainer(fromStructure);
        this.buildRoad(fromStructure);
    }

    private buildContainer(fromStructure: AnyStructure) {
        if (this.source.memory.containerId) return;

        if (this.source.memory.containerConstructionStarted) {
            const containerId = this.findContainerNearby();
            if (containerId) {
                this.source.memory.containerId = containerId;
                delete this.source.memory.containerConstructionStarted;
                return;
            }
        } else {
            const path = Traveler.findTravelPath(fromStructure, this.source).path;
            const [endOfPath] = path.slice(-1);
            if (!endOfPath) return;

            const constructionStatus = this.source.room.createConstructionSite(endOfPath, STRUCTURE_CONTAINER);
            if (constructionStatus === OK) {
                this.source.memory.containerConstructionStarted = true;
            }
        }
    }

    private findContainerNearby(): Id<StructureContainer> | undefined {
        const findResult = this.source.room
            .lookForAtArea(
                LOOK_STRUCTURES,
                this.source.pos.y - 1,
                this.source.pos.x - 1,
                this.source.pos.y + 1,
                this.source.pos.x + 1,
                true
            )
            .find(it => it.structure.structureType === STRUCTURE_CONTAINER);

        if (!findResult) return undefined;

        return findResult.structure.id as Id<StructureContainer>;
    }

    private buildRoad(fromStructure: AnyStructure) {
        if (this.source.memory.hasRoad) return;

        const path = Traveler.findTravelPath(fromStructure, this.source, {
            // Weigh road construction sites same as built roads
            roomCallback: (roomName: string, matrix: CostMatrix) => {
                let room = Game.rooms[roomName];
                if (room) {
                    for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
                        if (site.structureType === STRUCTURE_ROAD) {
                            matrix.set(site.pos.x, site.pos.y, 1);
                        }
                    }
                }

                return matrix;
            }
        }).path;

        buildRoadAtPositions(fromStructure.room, path);
        this.source.memory.hasRoad = true;
    }
}

export function buildInfrastructureForSources(sourceIds: Id<Source>[], fromStructure: AnyStructure) {
    sourceIds
        .map(it => Game.getObjectById(it))
        .filter((it): it is Source => Boolean(it))
        .forEach(source => new SourceInfrastructure(source).build(fromStructure));
}
