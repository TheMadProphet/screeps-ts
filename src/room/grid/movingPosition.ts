import {Position} from "./constants";

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

export class MovingPosition {
    x: number;
    y: number;
    direction: DirectionConstant;

    constructor({x, y, direction}: {x: number; y: number; direction: DirectionConstant}) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }

    public rotateClockwise() {
        if (this.direction === BOTTOM_LEFT) {
            this.direction = TOP_LEFT;
        } else {
            this.direction = ((this.direction + 2) % 8) as DirectionConstant;
        }
    }

    public move(steps: number) {
        this.x += DIRECTIONS[this.direction][0] * steps;
        this.y += DIRECTIONS[this.direction][1] * steps;
    }

    public getPosition(): Position {
        return {x: this.x, y: this.y};
    }
}
