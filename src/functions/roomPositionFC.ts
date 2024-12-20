export const roomPositionFC = () => {
    RoomPosition.prototype.getNearbyPositions = function () {
        let positions: RoomPosition[] = [];

        const startX = this.x - 1 || 1;
        const startY = this.y - 1 || 1;

        for (let x = startX; x <= this.x + 1 && x < 49; x++) {
            for (let y = startY; y <= this.y + 1 && y < 49; y++) {
                if (x !== this.x || y !== this.y) {
                    positions.push(new RoomPosition(x, y, this.roomName));
                }
            }
        }

        return positions;
    };

    RoomPosition.prototype.getWalkablePositions = function () {
        const nearbyPositions: RoomPosition[] = this.getNearbyPositions();
        const terrain = Game.map.getRoomTerrain(this.roomName);
        const walkablePositions: RoomPosition[] = Object.values(
            nearbyPositions
        ).filter((pos) => terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL);

        return walkablePositions;
    };

    RoomPosition.prototype.getOpenPositions = function () {
        const freePositions: RoomPosition[] = Object.values(
            <RoomPosition[]>this.getWalkablePositions()
        ).filter((pos: RoomPosition) => !pos.lookFor(LOOK_CREEPS).length);
        return freePositions;
    };
};
