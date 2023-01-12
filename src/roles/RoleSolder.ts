import { ISolder } from "../types/Solder";
import RoleCreep from "./RoleCreep";

const RoleSolder = {
    ...RoleCreep,
    ...{
        defaultSetupT1: [ATTACK, TOUGH, MOVE],
        defaultSetupT2: [ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE],
        defaultSetupT3: [
            ATTACK,
            ATTACK,
            ATTACK,
            ATTACK,
            TOUGH,
            TOUGH,
            TOUGH,
            TOUGH,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
        ],
        roleName: "solder",

        help: function (creep: ISolder) {
            let roomsToHelp = [];
            let routeToRoomsToHelp = null;

            if (!creep) {
                return;
            }

            if (Memory.needCreeps.solders?.length) {
                roomsToHelp = Memory.needCreeps.solders.filter((name) =>
                    Object.values(
                        Game.map.describeExits(creep.room.name) || []
                    ).includes(name)
                );

                if (roomsToHelp.length) {
                    const route = Game.map.findRoute(
                        creep.room.name,
                        roomsToHelp[0]
                    );
                    routeToRoomsToHelp = creep.pos.findClosestByRange(
                        route[0].exit
                    );
                }
                if (routeToRoomsToHelp) {
                    creep.moveTo(routeToRoomsToHelp);
                    return true;
                }
            }

            return false;
        },
    },
};

export default RoleSolder as unknown as ISolder;
