import { IArcher } from "../types/Archer";

import RoleSolder from "./RoleSolder";

const RoleArcher = {
    ...RoleSolder,
    ...{
        basicParts: [RANGED_ATTACK, TOUGH, MOVE],
        defaultSetupT1: [RANGED_ATTACK, TOUGH, MOVE],
        defaultSetupT2: [
            RANGED_ATTACK,
            RANGED_ATTACK,
            RANGED_ATTACK,
            MOVE,
            MOVE,
        ],
        defaultSetupT3: [
            RANGED_ATTACK,
            RANGED_ATTACK,
            RANGED_ATTACK,
            RANGED_ATTACK,
            MOVE,
            MOVE,
        ],
        roleName: "archer",
        run: function (creep: IArcher) {
            const closestHostile =
                creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                creep.say("Attack");
                if (creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestHostile, {
                        visualizePathStyle: { stroke: "#FF0000" },
                    });
                }
            } else {
                this.sleep(creep);
            }
        },
    },
};

export default RoleArcher as unknown as IArcher;
