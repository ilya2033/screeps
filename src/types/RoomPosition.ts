export interface IRoomPosition extends RoomPosition {
    getNearbyPositions: () => IRoomPosition[];
    getOpenPositions: () => IRoomPosition[];
}

export interface IRoomPositionConstructor extends _Constructor<IRoomPosition> {
    /**
     * You can create new RoomPosition object using its constructor.
     * @param x X position in the room.
     * @param y Y position in the room.
     * @param roomName The room name.
     */
    new (x: number, y: number, roomName: string): IRoomPosition;
    (x: number, y: number, roomName: string): IRoomPosition;
}
