import { ISolder } from "../types/Solder";
import { RoleCreep } from "./RoleCreep";

class RoleSolder extends RoleCreep implements ISolder {
    roleName = "solder";
    defaultSetupT1 = <BodyPartConstant[]>[ATTACK, TOUGH, MOVE];
    defaultSetupT2 = <BodyPartConstant[]>[
        ATTACK,
        ATTACK,
        TOUGH,
        TOUGH,
        TOUGH,
        MOVE,
        MOVE,
        MOVE,
    ];
    defaultSetupT3 = <BodyPartConstant[]>[
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
    ];

    help() {
        let roomsToHelp = [];
        let routeToRoomsToHelp = null;

        if (Memory.needCreeps.solders?.length) {
            roomsToHelp = Memory.needCreeps.solders.filter((name) =>
                Object.values(
                    Game.map.describeExits(this.room.name) || []
                ).includes(name)
            );

            if (roomsToHelp.length) {
                const route = Game.map.findRoute(
                    this.room.name,
                    roomsToHelp[0]
                );
                routeToRoomsToHelp = this.pos.findClosestByRange(route[0].exit);
            }
            if (routeToRoomsToHelp) {
                this.moveTo(routeToRoomsToHelp);
                return true;
            }
        }

        return false;
    }
}

export { RoleSolder };
