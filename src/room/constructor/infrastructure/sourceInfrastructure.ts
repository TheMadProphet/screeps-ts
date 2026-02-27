import {Traveler} from "../../../utils/traveler/traveler";
import {getAvailablePositionsAround} from "../../../creep/roomScanner";

declare global {
    interface SourceMemory {
        hasRoad?: boolean;
        roadConstructionStarted?: boolean;
        containerId?: Id<StructureContainer>;
        containerConstructionStarted?: boolean;
        linkId?: Id<StructureLink>;
        linkConstructionStarted?: boolean;
        linkMiningPos?: {x: number; y: number};
    }
}

class SourceInfrastructure {
    source: Source;

    constructor(source: Source) {
        this.source = source;
    }

    public build(fromStructure: AnyStructure) {
        const path = Traveler.findTravelPath(fromStructure, this.source, {
            roomCallback: this.getRoomCallbackForRoadPath()
        }).path;

        this.buildContainer(path);
        this.buildRoad(path);
        if ((this.source.room.controller?.level ?? 0) >= 6) {
            this.buildLink();
        }
    }

    private buildContainer(path: RoomPosition[]) {
        if (this.source.memory.containerId) return this.rebuildContainer(path);

        if (this.source.memory.containerConstructionStarted) {
            const containerId = this.findContainerNearby();
            if (containerId) {
                this.source.memory.containerId = containerId;
                delete this.source.memory.containerConstructionStarted;
            }
        } else {
            const [endOfPath] = path.slice(-1);
            if (!endOfPath) return;

            const constructionStatus = this.source.room.createConstructionSite(endOfPath, STRUCTURE_CONTAINER);
            if (constructionStatus === OK) {
                this.source.memory.containerConstructionStarted = true;
            }
        }
    }

    private buildLink() {
        if (this.source.memory.linkId) return;

        if (this.source.memory.linkConstructionStarted) {
            const linkId = this.findLinkNearby();
            if (linkId) {
                this.source.memory.linkId = linkId;
                this.source.room.memory.sourceLinkIds = this.source.room.memory.sourceLinkIds ?? [];
                this.source.room.memory.sourceLinkIds.push(linkId);
                delete this.source.memory.linkConstructionStarted;
            }

            return;
        }

        if (!this.source.room.canBuildStructure(STRUCTURE_LINK)) return;
        if (!this.isBestSourceForLink()) return;

        const [linkPos, miningPos] = this.getLinkPlacementPos();
        if (!linkPos || !miningPos)
            return console.log(`Cannot find position for source link near source ${this.source.id}`);

        const status = this.source.room.createConstructionSite(linkPos.x, linkPos.y, STRUCTURE_LINK);
        if (status === OK) {
            this.source.memory.linkConstructionStarted = true;
            this.source.memory.linkMiningPos = miningPos;
        } else {
            console.log(
                `Failed to create construction site for source link near source ${this.source.id} with status ${status}`
            );
        }
    }

    private isBestSourceForLink(): boolean {
        const centerPos = this.source.room.memory.gridCenter;
        const center = this.source.room.getPositionAt(centerPos.x, centerPos.y)!;
        const sources = this.source.room.find(FIND_SOURCES);

        const costForThisSource = Traveler.findTravelPath(center, this.source).cost;
        for (const source of sources) {
            if (source.id === this.source.id) continue;
            if (source.link || source.memory.linkConstructionStarted) continue;

            const cost = Traveler.findTravelPath(center, source).cost;
            if (cost > costForThisSource) {
                return false; // There is a source which is farther from the center
            }
        }

        return true;
    }

    private getLinkPlacementPos(): ({x: number; y: number} | null)[] {
        const center = this.source.room.memory.gridCenter;
        let bestPos: {x: number; y: number} | null = null;
        let miningPos: {x: number; y: number} | null = null;
        let bestDist = Infinity;
        for (const miningPosition of getAvailablePositionsAround(this.source)) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const x = miningPosition.x + dx,
                        y = miningPosition.y + dy;

                    if (this.source.pos.getRangeTo(x, y) !== 2) continue;

                    const dist = Math.max(Math.abs(x - center.x), Math.abs(y - center.y));
                    if (dist >= bestDist) continue;

                    const isBlocked = this.source.room
                        .lookAt(x, y)
                        .some(
                            obj =>
                                (obj.type === LOOK_TERRAIN && obj.terrain === "wall") ||
                                obj.type === LOOK_STRUCTURES ||
                                obj.type === LOOK_CONSTRUCTION_SITES
                        );
                    if (isBlocked) continue;

                    bestPos = {x, y};
                    miningPos = miningPosition;
                    bestDist = dist;
                }
            }
        }

        return [bestPos, miningPos];
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

    private findLinkNearby(): Id<StructureLink> | undefined {
        const findResult = this.source.pos
            .findInRange(FIND_MY_STRUCTURES, 2)
            .find(it => it.structureType === STRUCTURE_LINK);

        if (!findResult) return undefined;

        return findResult.id as Id<StructureLink>;
    }

    private buildRoad(path: RoomPosition[]) {
        if (this.source.memory.hasRoad) return this.rebuildRoad(path);

        if (this.source.memory.roadConstructionStarted) {
            const roadConstructionsAreBuilt = this.source.room
                .find(FIND_MY_CONSTRUCTION_SITES)
                .every(it => it.structureType !== STRUCTURE_ROAD);

            if (roadConstructionsAreBuilt) {
                this.source.memory.hasRoad = true;
                delete this.source.memory.roadConstructionStarted;
            }
        } else {
            _.forEach(path, pos => {
                pos.createConstructionSite(STRUCTURE_ROAD);
            });
            this.source.memory.roadConstructionStarted = true;
        }
    }

    private rebuildContainer(path: RoomPosition[]) {
        if (this.source.memory.containerId && !this.source.container) {
            delete this.source.memory.containerId;
        }

        if (!this.source.memory.containerId) {
            this.buildContainer(path);
        }
    }

    private rebuildRoad(path: RoomPosition[]) {
        for (const pos of path) {
            const isRoadOnPos = pos.lookFor(LOOK_STRUCTURES).some(it => it.structureType === STRUCTURE_ROAD);
            if (!isRoadOnPos) {
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
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

        if (source.memory.roadConstructionStarted || source.memory.containerConstructionStarted) {
            break; // Skip others while construction is not done
        }
    }
}
