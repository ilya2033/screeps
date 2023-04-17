const attackTimerScript = function (room: Room) {
    let time = Game.time;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const isHostiles = hostiles.length;

    if (isHostiles) {
        if (room.memory.attackTimer) {
            if (time - room.memory.attackTimer > 200) {
                room.memory.attacked = true;
            }
        } else {
            room.memory.attackTimer = time;
        }
    } else {
        room.memory.attackTimer = null;
        room.memory.attacked = false;
    }
};
export { attackTimerScript };
