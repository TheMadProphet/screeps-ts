import RoomInfrastructure from "./constructor/infrastructure";
import RoomStructures from "./constructor/structures";

(function (this: typeof Room.prototype) {
    this.automate = function () {
        new RoomInfrastructure(this).build();
        new RoomStructures(this).build();

        this.spawn.automate();
        // todo other structures i.e. tower

        this.drawVisuals();
    };

    this.buildRoad = function (from, to) {
        const path = this.findPath(from, to, {ignoreRoads: true, ignoreCreeps: true});

        for (const i in path) {
            const pos = path[i];

            if (to.x !== pos.x || to.y !== pos.y) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.buildBiDirectionalRoad = function (pos1, pos2) {
        this.buildRoad(pos1, pos2);

        const fromPos1 = PathFinder.search(pos1, {pos: pos2, range: 1});
        const fromPos2 = PathFinder.search(pos2, {pos: pos1, range: 0});

        const path = [...fromPos1.path, ...fromPos2.path];
        for (const i in path) {
            const pos = path[i];

            if ((pos1.x !== pos.x || pos1.y !== pos.y) && (pos2.x !== pos.x || pos2.y !== pos.y)) {
                this.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            }
        }
    };

    this.fillersAreEnabled = function () {
        return (
            this.controller != undefined &&
            this.controller.level >= 4 &&
            this.availableExtension === 0 &&
            this.storage !== null &&
            this.storage !== undefined
        );
    };

    this.hasEnergyEmergency = function () {
        if (!this.storage) return false;

        return this.storage.store.getUsedCapacity(RESOURCE_ENERGY) <= this.energyCapacityAvailable * 2;
    };

    this.drawVisuals = function () {
        const uiFlag = Game.flags["UI"];
        if (uiFlag && this.controller) {
            const x = uiFlag.pos.x + 1;
            let y = uiFlag.pos.y;

            const progress = Math.trunc((this.controller.progress / this.controller.progressTotal) * 100);
            this.visual.text(`Controller[${this.controller.level}]: ${progress}%`, x, y++, {
                align: "left",
                color: "#5a37cc",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            this.drawRoleStats(x, y++, UPGRADER);

            y++;
            this.visual.text(`Spawn: ${this.energyAvailable}/${this.energyCapacityAvailable}`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            const usedStorage = this.storage?.store?.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
            this.visual.text(`Storage: ${(usedStorage / 1000).toFixed(2)}K`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            if (this.hasEnergyEmergency()) {
                this.visual.text(`Emergency: ${this.hasEnergyEmergency()}`, x, y++, {
                    align: "left",
                    color: "#e09107",
                    stroke: "#000000",
                    strokeWidth: 0.1
                });
            }
            this.drawRoleStats(x, y++, HARVESTER);

            y++;
            this.drawRoleStats(x, y++, BUILDER);
            this.drawRoleStats(x, y++, HANDYMAN);
        }
    };

    this.drawRoleStats = function (x, y, role) {
        let count = 0;
        if (this.spawn.creepsByRole[role]) {
            count = this.spawn.creepsByRole[role]?.length ?? 0;
        }

        this.visual.text(`${role}: ${count}`, x, y, {
            align: "left",
            color: "#a6a6a6",
            stroke: "#000000",
            strokeWidth: 0.05
        });
    };
}).call(Room.prototype);

Object.defineProperty(Room.prototype, "spawn", {
    get: function () {
        if (!this._spawn) {
            if (!this.memory.spawnId) {
                this.memory.spawnId = this.find(FIND_MY_SPAWNS)[0].id;
            }
            this._spawn = Game.getObjectById(this.memory.spawnId);
        }

        return this._spawn;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "availableExtension", {
    get: function () {
        if (!this._availableExtension) {
            this._availableExtension = getAvailableStructure(this, STRUCTURE_EXTENSION);
        }

        return this._availableExtension;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "constructionSites", {
    get: function () {
        if (!this._constructionSites) {
            this._constructionSites = this.find(FIND_MY_CONSTRUCTION_SITES);
        }

        return this._constructionSites;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, "rawSources", {
    get: function () {
        if (!this._rawSources) {
            if (!this.memory.rawSourceIds) {
                this.memory.rawSourceIds = this.find(FIND_SOURCES).map((source: Source) => source.id);
            }
            this._rawSources = this.memory.rawSourceIds.map((id: Id<Source>) => Game.getObjectById(id));
        }

        return this._rawSources;
    },
    enumerable: false,
    configurable: true
});

function getAvailableStructure(room: Room, structureType: BuildableStructureConstant) {
    if (!room.controller) return 0;

    const currentlyBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: structure => structure.structureType === structureType
    }).length;

    const maxAvailable = getMaxStructureForController(structureType, room.controller.level);

    return maxAvailable - currentlyBuilt;
}

const getMaxStructureForController = (structureType: BuildableStructureConstant, controllerLevel: number) => {
    switch (structureType) {
        case STRUCTURE_EXTENSION:
            if (controllerLevel <= 1) return 0;
            if (controllerLevel === 2) return 5;
            return (controllerLevel - 2) * 10;
    }

    return 0;
};
