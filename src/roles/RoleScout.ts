import { ICreep } from "../types/Creep";
import { IScout } from "../types/Scout";

import RoleSolder from "./RoleSolder";

const RoleScout = {
    ...RoleSolder,
    ...{
        defaultSetupT1: [MOVE],

        basicParts: null,
        roleName: "scout",

        run: function (creep: IScout, roomToFind = null) {
            this.recordRoom(creep);
            let routes = {};
            if (
                creep.room.find(FIND_STRUCTURES, {
                    filter: (st) => st.structureType === STRUCTURE_POWER_BANK,
                }).length
            ) {
                return;
            }
            if (!roomToFind) {
                const rooms = Object.values(
                    Game.map.describeExits(creep.room.name)
                );
                const unknownRooms = rooms.filter(
                    (roomId) => !Memory.rooms[roomId]
                );

                if (unknownRooms.length) {
                    routes = Game.map.findRoute(
                        creep.room.name,
                        unknownRooms[Math.random() * unknownRooms.length - 1]
                    );
                } else {
                    routes = Game.map.findRoute(
                        creep.room.name,
                        rooms[Math.random() * rooms.length - 1]
                    );
                }
            } else {
                routes = Game.map.findRoute(creep.room.name, roomToFind);
            }

            const closestRoute = creep.pos.findClosestByRange(routes[0]?.exit);

            if (closestRoute) {
                creep.moveTo(closestRoute);
            }
        },
    },
};

export default RoleScout as unknown as IScout;
