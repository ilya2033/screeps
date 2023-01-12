import { IScout } from "../types/Scout";

import RoleSolder from "./RoleSolder";

const RoleScout = {
    ...RoleSolder,
    ...{
        defaultSetupT1: [MOVE],

        basicParts: null,
        roleName: "scout",
        run: function (creep: IScout) {
            let routes = {};
            if (
                creep.room.find(FIND_STRUCTURES, {
                    filter: (st) => st.structureType === STRUCTURE_POWER_BANK,
                }).length
            ) {
                return;
            }
            const unknownRooms = Object.values(
                Game.map.describeExits(creep.room.name)
            ).filter((roomId) => !Game.rooms[roomId]);

            if (unknownRooms.length) {
                routes = Game.map.findRoute(creep.room.name, unknownRooms[0]);
            } else {
                return;
            }

            const closestRoute = creep.pos.findClosestByRange(routes[0].exit);

            if (closestRoute) {
                creep.moveTo(closestRoute);
            } else {
                this.sleep(creep);
            }
        },
    },
};

export default RoleScout as unknown as IScout;
