import {MovingPosition} from "./movingPosition";
import {Cell} from "./cell";

export type Position = {x: number; y: number};

declare global {
    interface RoomMemory {
        gridCenter: Position;
        gridExtensionCellIndex: number;
        gridMiscCellIndex: number;
    }
}

type MiscStructure = STRUCTURE_SPAWN | STRUCTURE_OBSERVER | STRUCTURE_POWER_SPAWN | STRUCTURE_FACTORY | STRUCTURE_NUKER;

export const CELL_SIZE = 3;
export const BETTER_CELL_SIZE = 2;
export const CELL_SPACING = 1;

class RoomGrid {
    public getPositionForStructure(room: Room, structureType: BuildableStructureConstant): Position | undefined {
        this.initializeGridMemory(room);

        const gridCenter = room.memory.gridCenter;
        if (structureType === STRUCTURE_EXTENSION) {
            return this.getPositionForExtension(room);
        } else if (structureType === STRUCTURE_SPAWN) {
            if (room.lookForAt(LOOK_STRUCTURES, gridCenter.x + 1, gridCenter.y).length === 0) {
                return {x: gridCenter.x + 1, y: gridCenter.y};
            } else {
                return this.getPositionForMiscStructure(room, structureType);
            }
        } else if (structureType === STRUCTURE_STORAGE) {
            return gridCenter;
        } else if (structureType === STRUCTURE_TERMINAL) {
            return {x: gridCenter.x, y: gridCenter.y + 1};
        } else if (structureType === STRUCTURE_LAB) {
            // todo
        } else if (
            structureType === STRUCTURE_OBSERVER ||
            structureType === STRUCTURE_POWER_SPAWN ||
            structureType === STRUCTURE_FACTORY ||
            structureType === STRUCTURE_NUKER
        ) {
            return this.getPositionForMiscStructure(room, structureType);
        }

        return undefined;
    }

    private initializeGridMemory(room: Room) {
        if (!room.memory.gridCenter) {
            room.memory.gridCenter = {x: room.spawn.pos.x + 1, y: room.spawn.pos.y};
        }

        if (!room.memory.gridMiscCellIndex) {
            room.memory.gridMiscCellIndex = this.findMiscCellIndex(room);
        }

        if (!room.memory.gridExtensionCellIndex) {
            room.memory.gridExtensionCellIndex = room.memory.gridMiscCellIndex !== 1 ? 1 : 2;
        }
    }

    public drawGridForRoom(room: Room, cellCount = 9) {
        if (!room.memory.gridCenter) {
            room.memory.gridCenter = {x: room.spawn.pos.x + 1, y: room.spawn.pos.y};
        }

        for (let i = 0; i < cellCount; i++) {
            this.getCell(room, i).draw();
        }

        room.visual.connectRoads();
    }

    public getCell(room: Room, cellIndex: number): Cell {
        const ringIndex = this.getRingIndex(cellIndex);
        const indexWithinRing = cellIndex - ringIndex * ringIndex;

        let movingPosition = new MovingPosition({
            x: room.memory.gridCenter.x,
            y: room.memory.gridCenter.y - ringIndex * (CELL_SIZE + CELL_SPACING),
            direction: BOTTOM_RIGHT
        });

        for (let i = 0; i < indexWithinRing; i++) {
            if (i > 0 && i % (ringIndex * 2) === 0) {
                movingPosition.rotateClockwise();
            }

            movingPosition.move(Math.ceil(CELL_SIZE / 2));
        }

        return new Cell(room, movingPosition.getPosition());
    }

    private getRingIndex(cellIndex: number) {
        if (cellIndex < 1) return 0;
        if (cellIndex < 9) return 1;
        if (cellIndex < 25) return 2;
        if (cellIndex < 49) return 3;
        return 4;
    }

    private getPositionForExtension(room: Room): Position {
        const vacantPosition = this.getCell(room, room.memory.gridExtensionCellIndex).findVacantPosition();
        if (vacantPosition) return vacantPosition;

        room.memory.gridExtensionCellIndex += 1;
        if (room.memory.gridExtensionCellIndex === room.memory.gridMiscCellIndex)
            room.memory.gridExtensionCellIndex += 1;

        return this.getPositionForExtension(room);
    }

    private findMiscCellIndex(room: Room): number {
        for (let i = 1; i < 50; i++) {
            const cell = this.getCell(room, i);
            if (cell.allPositionsAreVacant()) {
                return i;
            }
        }

        return -1;
    }

    private getPositionForMiscStructure(room: Room, structure: MiscStructure): Position {
        const cell = this.getCell(room, room.memory.gridMiscCellIndex);

        switch (structure) {
            case STRUCTURE_SPAWN:
                return {x: cell.center.x - 1, y: cell.center.y};
            case STRUCTURE_FACTORY:
                return cell.center;
            case STRUCTURE_POWER_SPAWN:
                return {x: cell.center.x + 1, y: cell.center.y};
            case STRUCTURE_NUKER:
                return {x: cell.center.x, y: cell.center.y - 1};
            case STRUCTURE_OBSERVER:
                return {x: cell.center.x, y: cell.center.y + 1};
        }
    }
}

const roomGrid = new RoomGrid();
export default roomGrid;
