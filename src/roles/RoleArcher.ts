import { IArcher } from "../types/Archer";

import { RoleSolder } from "./RoleSolder";

class RoleArcher extends RoleSolder implements IArcher {
    roleName = "archer";
    basicParts = [RANGED_ATTACK, TOUGH, MOVE];
    defaultSetupT1 = [RANGED_ATTACK, TOUGH, MOVE];
    defaultSetupT2 = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE];
    defaultSetupT3 = [
        RANGED_ATTACK,
        RANGED_ATTACK,
        RANGED_ATTACK,
        RANGED_ATTACK,
        MOVE,
        MOVE,
    ];

    run() {
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            this.say("Attack");
            if (this.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                this.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { RoleArcher };
