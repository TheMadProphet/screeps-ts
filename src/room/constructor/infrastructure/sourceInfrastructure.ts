import {Traveler} from "../../../utils/traveler/traveler";
import {buildRoadAtPositions} from "../helper";

declare global {
    interface SourceMemory {
        hasRoad?: boolean;
        roadConstructionStarted?: boolean;
        containerId?: Id<StructureContainer>;
        containerConstructionStarted?: boolean;
    }
}

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

        if (this.source.memory.roadConstructionStarted) {
            const roadConstructionsAreBuilt = this.source.room
                .find(FIND_MY_CONSTRUCTION_SITES)
                .every(it => it.structureType !== STRUCTURE_ROAD);

            if (roadConstructionsAreBuilt) {
                this.source.memory.hasRoad = true;
                delete this.source.memory.roadConstructionStarted;
            }
        } else {
            const path = Traveler.findTravelPath(fromStructure, this.source, {
                roomCallback: this.getRoomCallbackForRoadPath()
            }).path;

            buildRoadAtPositions(fromStructure.room, path);
            this.source.memory.roadConstructionStarted = true;
        }
    }

    private getRoomCallbackForRoadPath() {
        // Ignore if road is construction site, treat it as built road
        return (roomName: string, matrix: CostMatrix) => {
            let room = Game.rooms[roomName];
            if (room) {
                for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
                    if (site.structureType === STRUCTURE_ROAD) {
                        matrix.set(site.pos.x, site.pos.y, 1);
                    }
                }
            }

            return matrix;
        };
    }
}

export function buildInfrastructureForSources(sourceIds: Id<Source>[], fromStructure: AnyStructure) {
    const sources = sourceIds.map(it => Game.getObjectById(it)).filter((it): it is Source => Boolean(it));

    for (const source of sources) {
        new SourceInfrastructure(source).build(fromStructure);

        if (source.memory.roadConstructionStarted) {
            break; // Skip others while construction is not done
        }
    }
}
