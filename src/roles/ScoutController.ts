import { IScout } from "../types/Scout";
import { SolderController } from "./SolderController";

class ScoutController extends SolderController {
    creep: IScout;
    static roleName = "scout";
    static basicParts = null;
    static defaultSetupT1 = [MOVE];

    run(roomToCheck?: string) {
        this.recordRoom();
        let routes = {};
        if (
            this.creep.room.find(FIND_STRUCTURES, {
                filter: (st) => st.structureType === STRUCTURE_POWER_BANK,
            }).length
        ) {
            return;
        }

        const rooms = Object.values(
            Game.map.describeExits(this.creep.room.name)
        );
        const unknownRooms = rooms.filter((roomId) => !Memory.rooms[roomId]);

        if (unknownRooms.length) {
            routes = Game.map.findRoute(
                this.creep.room.name,
                unknownRooms[Math.random() * unknownRooms.length - 1]
            );
        } else {
            routes = Game.map.findRoute(
                this.creep.room.name,
                rooms[Math.random() * rooms.length - 1]
            );
        }

        const closestRoute = this.creep.pos.findClosestByRange(routes[0]?.exit);

        if (closestRoute) {
            this.creep.moveTo(closestRoute);
        } else {
            this.sleep();
        }
    }
}

export { ScoutController };
