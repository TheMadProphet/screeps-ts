import {BUILDER, CreepRole, HANDYMAN, HAULER, MINER, UPGRADER} from "../constants";

class RoomVisuals {
    room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    visualize() {
        const uiFlag = Game.flags["UI"];
        if (uiFlag && this.room.controller) {
            const x = uiFlag.pos.x + 1;
            let y = uiFlag.pos.y;

            const progress = Math.trunc((this.room.controller.progress / this.room.controller.progressTotal) * 100);
            this.room.visual.text(`Controller[${this.room.controller.level}]: ${progress}%`, x, y++, {
                align: "left",
                color: "#5a37cc",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            this.drawRoleStats(x, y++, UPGRADER);

            y++;
            this.room.visual.text(`Spawn: ${this.room.energyAvailable}/${this.room.energyCapacityAvailable}`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            const usedStorage = this.room.storage?.store?.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
            this.room.visual.text(`Storage: ${(usedStorage / 1000).toFixed(2)}K`, x, y++, {
                align: "left",
                color: "#e09107",
                stroke: "#000000",
                strokeWidth: 0.1
            });
            if (this.room.hasEnergyEmergency()) {
                this.room.visual.text(`Emergency: ${this.room.hasEnergyEmergency()}`, x, y++, {
                    align: "left",
                    color: "#e09107",
                    stroke: "#000000",
                    strokeWidth: 0.1
                });
            }
            this.drawRoleStats(x, y++, MINER);
            this.drawRoleStats(x, y++, HAULER);

            y++;
            this.drawRoleStats(x, y++, BUILDER);
            this.drawRoleStats(x, y++, HANDYMAN);
        }
    }

    drawRoleStats(x: number, y: number, role: CreepRole) {
        let count = 0;
        if (this.room.spawn.creepsByRole[role]) {
            count = this.room.spawn.creepsByRole[role]?.length ?? 0;
        }

        this.room.visual.text(`${role}: ${count}`, x, y, {
            align: "left",
            color: "#a6a6a6",
            stroke: "#000000",
            strokeWidth: 0.05
        });
    }
}

export default RoomVisuals;
