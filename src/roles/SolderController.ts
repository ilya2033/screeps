import { ISolder } from "../types/Solder";
import { CreepController } from "./CreepController";

class SolderController extends CreepController {
    creep: ISolder;

    static roleName = "solder";
    static defaultSetupT1 = <BodyPartConstant[]>[ATTACK, TOUGH, MOVE];
    static defaultSetupT2 = <BodyPartConstant[]>[
        ATTACK,
        ATTACK,
        TOUGH,
        TOUGH,
        TOUGH,
        MOVE,
        MOVE,
        MOVE,
    ];
    static defaultSetupT3 = <BodyPartConstant[]>[
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
                    Game.map.describeExits(this.creep.room.name) || []
                ).includes(name)
            );

            if (roomsToHelp.length) {
                const route = Game.map.findRoute(
                    this.creep.room.name,
                    roomsToHelp[0]
                );
                routeToRoomsToHelp = this.creep.pos.findClosestByRange(
                    route[0].exit
                );
            }
            if (routeToRoomsToHelp) {
                this.creep.moveTo(routeToRoomsToHelp);
                return true;
            }
        }

        return false;
    }
}

export { SolderController };
