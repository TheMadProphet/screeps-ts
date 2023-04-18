import {BETTER_CELL_SIZE, CELL_SIZE, CELL_SPACING, Position} from "./roomGrid";
import {MovingPosition} from "./movingPosition";

export class Cell {
    room: Room;
    center: Position;

    constructor(room: Room, center: Position) {
        this.room = room;
        this.center = center;
    }

    public findVacantPosition(): Position | undefined {
        for (const pos of this.getAllPositions()) {
            if (this.isPositionVacant(pos.x, pos.y, this.room)) {
                return pos;
            }
        }

        return undefined;
    }

    public allPositionsAreVacant(): boolean {
        for (const pos of this.getAllPositions()) {
            if (!this.isPositionVacant(pos.x, pos.y, this.room)) {
                return false;
            }
        }

        return true;
    }

    public draw() {
        let movingPosition = new MovingPosition({
            x: this.center.x,
            y: this.center.y - (CELL_SIZE - 1) / 2 - CELL_SPACING,
            direction: BOTTOM_RIGHT
        });

        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % Math.ceil(CELL_SIZE / 2) === 0) {
                movingPosition.rotateClockwise();
            }

            movingPosition.move(1);
            this.room.visual.structure(movingPosition.x, movingPosition.y, STRUCTURE_ROAD);
        }
    }

    private getAllPositions(): Position[] {
        const result: Position[] = [];
        const offset = BETTER_CELL_SIZE - 1;

        for (let x = this.center.x - offset; x <= this.center.x + offset; x++) {
            result.push({x, y: this.center.y});
        }

        for (let y = this.center.y - offset; y <= this.center.y + offset; y++) {
            result.push({x: this.center.x, y: y});
        }

        return result;
    }

    private isPositionVacant(x: number, y: number, room: Room) {
        for (const lookObject of room.lookAt(x, y)) {
            switch (lookObject.type) {
                case LOOK_TERRAIN:
                    if (lookObject.terrain === "wall") return false;
                    break;
                case LOOK_STRUCTURES:
                    if (lookObject.structure?.structureType != STRUCTURE_ROAD) return false;
                    break;
                case LOOK_CONSTRUCTION_SITES:
                    if (lookObject.constructionSite?.structureType != STRUCTURE_ROAD) return false;
            }
        }

        return this.energySourceIsNotNear({x, y}, room);
    }

    private energySourceIsNotNear(pos: Position, room: Room) {
        const area = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1);
        for (const y in area) {
            for (const x in area[y]) {
                const objects = area[y][x];
                for (const i in objects) {
                    const object = objects[i];

                    if (object.type === LOOK_SOURCES) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}
