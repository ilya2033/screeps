import { RoleScout } from "../roles/RoleScout";
import { ICreep } from "../types/Creep";
import { IScout } from "../types/Scout";

export const checkNearRoomsScript = (room: Room) => {
    let time = Game.time;
    let needToCheck: string[] = [];
    const scoutes: RoleScout[] = Object.values(Game.creeps).filter(
        (creep: ICreep) =>
            creep.memory.role === "scout" &&
            creep.memory.spawnRoom === room.name
    );
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
        if (!scoutes?.length) {
            const spawns = room.find(FIND_MY_SPAWNS);
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    // RoleScout.spawn(spawn);
                    break;
                }
            }
        } else {
            scoutes.forEach((creep) => creep.run(needToCheck[0]));
            return;
        }
    } else {
        scoutes.forEach((creep) => creep.run());
    }
};
