export function buildRoadAtPositions(room: Room, positions: RoomPosition[]) {
    _.forEach(positions, pos => {
        const terrain = room.lookForAt(LOOK_TERRAIN, pos.x, pos.y)[0];

        if (terrain !== "wall") {
            room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
        }
    });
}

export function getPositionsAround(position: RoomPosition, length: number) {
    const room = Game.rooms[position.roomName];
    const result: RoomPosition[] = [];
    let y = position.y - length;
    while (y <= position.y + length) {
        const deltaX = Math.abs(position.y - y) - length;
        if (deltaX === 0) {
            const pos = room.getPositionAt(position.x, y);
            if (pos) result.push(pos);
        } else {
            const left = room.getPositionAt(position.x - deltaX, y);
            if (left) result.push(left);

            const right = room.getPositionAt(position.x + deltaX, y);
            if (right) result.push(right);
        }

        y++;
    }

    return result;
}
