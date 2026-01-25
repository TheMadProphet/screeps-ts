import {Traveler} from "../../../utils/traveler/traveler";

declare global {
    interface MineralMemory {
        hasRoad?: boolean;
        roadConstructionStarted?: boolean;
        containerId?: Id<StructureContainer>;
        containerConstructionStarted?: boolean;
        extractorId?: Id<StructureExtractor>;
    }
}

class MineralInfrastructure {
    mineral: Mineral;

    constructor(mineral: Mineral) {
        this.mineral = mineral;
    }

    public build(fromStructure: AnyStructure) {
        const path = Traveler.findTravelPath(fromStructure, this.mineral, {
            roomCallback: this.getRoomCallbackForRoadPath()
        }).path;

        this.buildExtractor();
        this.buildContainer(path);
        this.buildRoad(path);
    }

    public rebuild(fromStructure: AnyStructure) {
        const path = Traveler.findTravelPath(fromStructure, this.mineral, {
            roomCallback: this.getRoomCallbackForRoadPath()
        }).path;

        // Extractor and container will be rebuilt in `build` methods if needed
        this.rebuildRoad(path);
    }

    private buildExtractor() {
        const extractorId = this.mineral.memory.extractorId;
        if (extractorId) {
            if (Game.getObjectById(extractorId)) {
                return;
            }

            delete this.mineral.memory.extractorId;
        }

        const extractor = this.mineral.pos.lookFor(LOOK_STRUCTURES);
        if (extractor.length > 0) {
            this.mineral.memory.extractorId = extractor[0].id as Id<StructureExtractor>;
        } else {
            this.mineral.room?.createConstructionSite(this.mineral.pos, STRUCTURE_EXTRACTOR);
        }
    }

    private buildContainer(path: RoomPosition[]) {
        if (this.mineral.memory.containerId) {
            if (Game.getObjectById(this.mineral.memory.containerId)) {
                return;
            }

            delete this.mineral.memory.containerId;
        }

        if (this.mineral.memory.containerConstructionStarted) {
            const containerId = this.findContainerNearby();
            if (containerId) {
                this.mineral.memory.containerId = containerId;
                delete this.mineral.memory.containerConstructionStarted;
            }
        } else {
            const [endOfPath] = path.slice(-1);
            if (!endOfPath) return;

            const constructionStatus = this.mineral.room?.createConstructionSite(endOfPath, STRUCTURE_CONTAINER);
            if (constructionStatus === OK) {
                this.mineral.memory.containerConstructionStarted = true;
            }
        }
    }

    private findContainerNearby(): Id<StructureContainer> | undefined {
        const findResult = this.mineral.room
            ?.lookForAtArea(
                LOOK_STRUCTURES,
                this.mineral.pos.y - 1,
                this.mineral.pos.x - 1,
                this.mineral.pos.y + 1,
                this.mineral.pos.x + 1,
                true
            )
            ?.find(it => it.structure.structureType === STRUCTURE_CONTAINER);

        if (!findResult) return undefined;

        return findResult.structure.id as Id<StructureContainer>;
    }

    private buildRoad(path: RoomPosition[]) {
        if (this.mineral.memory.hasRoad) return;

        if (this.mineral.memory.roadConstructionStarted) {
            const roadConstructionsAreBuilt = this.mineral.room
                ?.find(FIND_MY_CONSTRUCTION_SITES)
                ?.every(it => it.structureType !== STRUCTURE_ROAD);

            if (roadConstructionsAreBuilt) {
                this.mineral.memory.hasRoad = true;
                delete this.mineral.memory.roadConstructionStarted;
            }
        } else {
            _.forEach(path, pos => {
                pos.createConstructionSite(STRUCTURE_ROAD);
            });
            this.mineral.memory.roadConstructionStarted = true;
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

export function buildInfrastructureForMineral(mineralId: Id<Mineral>) {
    const mineral = Game.getObjectById(mineralId);

    if (!mineral || !mineral.room?.storage) return;

    new MineralInfrastructure(mineral).build(mineral.room.storage);
}

export function rebuildMineralInfrastructure(mineralId: Id<Mineral>) {
    const mineral = Game.getObjectById(mineralId);

    if (!mineral || !mineral.room?.storage) return;

    new MineralInfrastructure(mineral).rebuild(mineral.room.storage);
}
