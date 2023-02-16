/*
 * Source: https://github.com/screepers/screeps-snippets/blob/master/src/prototypes/TypeScript/excuseMe.ts
 *
 * A set of functions that makes creeps tell other creeps to get out of the way using creep memory
 *
 * call so creep reacts to being nudged
 * Creep.giveWay() - swaps places with creep that nudged it
 * Creep.giveWay(true) - moves into random available spot
 * Creep.giveWay({pos: controller.pos, range: 3 }) - moves into random available spot in range of target, if none are avaiable fallbacks to random spot
 */

/*
 * if alwaysNudge false you have to call Creep.move with additional argument -
 * creep.move(direction, true); - for creep to nudge other creeps,
 * so it's not compatible with creep.moveTo
 *
 * if alwaysNudge is true then creeps... always nudge creeps in front of them
 */
const alwaysNudge = true;

/*
 * type declarations
 */
declare global {
    interface Creep {
        giveWay(): void;

        move(direction: DirectionConstant, excuse: boolean): CreepMoveReturnCode;
    }

    interface CreepMemory {
        excuseMe?: DirectionConstant;
    }
}

/*
 * some utils that I'm using
 */
const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];

function getOppositeDir(dir: DirectionConstant) {
    return (((dir + 3) % 8) + 1) as DirectionConstant;
}

/*
 * a nudge
 */
function excuseMe(pos: RoomPosition, direction: DirectionConstant) {
    const nextX = pos.x + offsetX[direction];
    const nextY = pos.y + offsetY[direction];
    if (nextX > 49 || nextX < 0 || nextY > 49 || nextY < 0) return;

    const room = Game.rooms[pos.roomName];
    const creeps = room.lookForAt(LOOK_CREEPS, nextX, nextY);
    if (creeps.length > 0 && creeps[0].my) creeps[0].memory.excuseMe = getOppositeDir(direction);
}

/*
 *
 */
let creepsThatTriedToMove: {[key: string]: RoomPosition} = {};
const oldMove = Creep.prototype.move as (direction: DirectionConstant | Creep) => CreepMoveReturnCode;
// @ts-ignore
Creep.prototype.move = function (direction: DirectionConstant | Creep, nudge?: boolean) {
    if ((alwaysNudge || nudge) && _.isNumber(direction)) excuseMe(this.pos, direction);
    creepsThatTriedToMove[this.name] = this.pos;
    return oldMove.call(this, direction);
};

/*
 * call this on creeps that should react to being nudged
 */
function giveWay(creep: Creep) {
    if (creep.memory.excuseMe) {
        creep.move(creep.memory.excuseMe, true);
    }
}

Creep.prototype.giveWay = function () {
    giveWay(this);
};

/*
 * clears nudges from memory of creeps that moved
 * call on tick start
 */
export function clearNudges() {
    for (let creepName in creepsThatTriedToMove) {
        const creep = Game.creeps[creepName];
        const prevPos = creepsThatTriedToMove[creepName];
        if (!creep || !creep.pos.isEqualTo(prevPos)) {
            const creepMemory = Memory.creeps[creepName];
            if (creepMemory) creepMemory.excuseMe = undefined;
            delete creepsThatTriedToMove[creepName];
        }
    }
}
