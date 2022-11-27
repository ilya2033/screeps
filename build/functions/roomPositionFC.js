export const roomPositionFC = () => {
    RoomPosition.prototype.getNearbyPositions = function () {
        let positions = [];
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
    RoomPosition.prototype.getOpenPositions = function () {
        const nearbyPositions = this.getNearbyPositions();
        const terrain = Game.map.getRoomTerrain(this.roomName);
        const walkablePositions = Object.values(nearbyPositions).filter((pos) => terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL);
        const freePositions = Object.values(walkablePositions).filter((pos) => !pos.lookFor(LOOK_CREEPS).length);
        return freePositions;
    };
};
