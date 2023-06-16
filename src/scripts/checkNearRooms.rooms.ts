import { ScoutController } from "../roles/ScoutController";

export const checkNearRoomsScript = (room: Room) => {
    let time = Game.time;
    let needToCheck: string[] = [];
    const scouteControllers: ScoutController[] =
        ScoutController.getAllControllers();

    if (!room.memory.nearRooms?.length) {
        const nearExists = Game.map.describeExits(room.name);
        Object.values(nearExists).forEach((roomName) => {
            room.memory.nearRooms.push(roomName);
        });
    } else {
        room.memory.nearRooms.forEach((name) => {
            const nearRoom = Memory.rooms[name] || null;
            if (
                !nearRoom?.lastChecked ||
                time - nearRoom?.lastChecked > 10000
            ) {
                needToCheck.push(name);
            }
        });
    }

    if (needToCheck.length) {
        if (!scouteControllers?.length) {
            const spawns = room.find(FIND_MY_SPAWNS);
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    // RoleScout.spawn(spawn);
                    break;
                }
            }
        } else {
            scouteControllers.forEach((controller) =>
                controller.run(needToCheck[0])
            );
            return;
        }
    } else {
        scouteControllers.forEach((controller) => controller.run());
    }
};
