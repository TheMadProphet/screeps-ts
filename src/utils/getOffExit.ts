/**
 * Source: https://github.com/screepers/screeps-snippets/blob/8b557a3fcb82cb734fca155b07d5a48622f9da60/src/prototypes/JavaScript/Creep/Creep.getOffExit.js
 * Converted to TS and adjusted some parts
 */

// engineeryo 7 February 2017 at 04:46

export {};

declare global {
    interface RoomPosition {
        fromDirection(direction: DirectionConstant): RoomPosition;
    }

    interface Creep {
        getOffExit(): boolean;
    }
}

const DIRECTIONS: Record<DirectionConstant, number[]> = {
    [TOP]: [0, -1],
    [TOP_RIGHT]: [1, -1],
    [RIGHT]: [1, 0],
    [BOTTOM_RIGHT]: [1, 1],
    [BOTTOM]: [0, 1],
    [BOTTOM_LEFT]: [-1, 1],
    [LEFT]: [-1, 0],
    [TOP_LEFT]: [-1, -1]
};

RoomPosition.prototype.fromDirection = function (direction: DirectionConstant) {
    return new RoomPosition(this.x + DIRECTIONS[direction][0], this.y + DIRECTIONS[direction][1], this.roomName);
};

Creep.prototype.getOffExit = function () {
    const directionsFromExit = {
        x: {
            49: [LEFT, TOP_LEFT, BOTTOM_LEFT],
            0: [RIGHT, TOP_RIGHT, BOTTOM_RIGHT]
        } as Record<number, DirectionConstant[]>,
        y: {
            49: [TOP, TOP_LEFT, TOP_RIGHT],
            0: [BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT]
        } as Record<number, DirectionConstant[]>
    };

    const allowedDirections: DirectionConstant[] = [];
    if (directionsFromExit.x[this.pos.x]) {
        // Are we on the left / right exits?
        allowedDirections.push(...directionsFromExit.x[this.pos.x]);
    } else if (directionsFromExit.y[this.pos.y]) {
        // or are we on the top / bottom exits?
        allowedDirections.push(...directionsFromExit.y[this.pos.y]);
    }

    if (!allowedDirections.length) return false;

    for (let direction of allowedDirections) {
        let stuff = this.pos.fromDirection(direction).look(); // collection of things at our potential target
        const index = stuff.findIndex(
            p =>
                p.type === LOOK_CREEPS ||
                (p.structure && OBSTACLE_OBJECT_TYPES.includes(p.structure.structureType as any)) ||
                p.terrain == "wall"
        );

        if (index == -1) {
            this.move(direction);
            return true;
        }
    }

    return false;
};
