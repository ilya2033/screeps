const roadScript = function (room: Room) {
    const roads = room.memory.roads || [];
    if (Game.time % 1000 === 0) {
        roads.forEach((road) => {
            if (road.count > 70) {
                room.createConstructionSite(road.x, road.y, STRUCTURE_ROAD);
            }
        });
        room.memory.roads = [];
    }
};

export { roadScript };
