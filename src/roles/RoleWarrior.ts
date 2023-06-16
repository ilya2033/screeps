import { IWarrior } from "../types/Warrior";

import { RoleSolder } from "./RoleSolder";

class RoleWarrior extends RoleSolder implements IWarrior {
    roleName = "warrior";
    basicParts = <BodyPartConstant[]>[ATTACK, TOUGH, MOVE];
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
    run() {
        const closestHostile =
            this.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ||
            this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (st: Structure) =>
                    st.structureType === STRUCTURE_POWER_BANK,
            });

        if (closestHostile) {
            this.say("Attack");
            if (this.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                this.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { RoleWarrior };
