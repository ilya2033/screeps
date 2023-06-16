import { IScout } from "../types/Scout";
import { RoleSolder } from "./RoleSolder";

class RoleScout extends RoleSolder implements IScout {
    roleName = "scout";
    basicParts = null;
    defaultSetupT1 = [MOVE];
    run() {
        this.recordRoom();
        let routes = {};
        if (
            this.room.find(FIND_STRUCTURES, {
                filter: (st) => st.structureType === STRUCTURE_POWER_BANK,
            }).length
        ) {
            return;
        }

        const rooms = Object.values(Game.map.describeExits(this.room.name));
        const unknownRooms = rooms.filter((roomId) => !Memory.rooms[roomId]);

        if (unknownRooms.length) {
            routes = Game.map.findRoute(
                this.room.name,
                unknownRooms[Math.random() * unknownRooms.length - 1]
            );
        } else {
            routes = Game.map.findRoute(
                this.room.name,
                rooms[Math.random() * rooms.length - 1]
            );
        }

        const closestRoute = this.pos.findClosestByRange(routes[0]?.exit);

        if (closestRoute) {
            this.moveTo(closestRoute);
        } else {
            this.sleep();
        }
    }
}

export { RoleScout };
