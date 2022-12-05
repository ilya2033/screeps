import { IWarrior } from "../types/Warrior";

import RoleSolder from "./RoleSolder";

const RoleWarrior = {
    ...RoleSolder,
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
        basicParts: [ATTACK, TOUGH, MOVE],
        roleName: "warrior",
        run: function (creep: IWarrior) {
            const closestHostile =
                creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

            if (closestHostile) {
                creep.say("Attack");
                if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
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

export default RoleWarrior as unknown as IWarrior;
