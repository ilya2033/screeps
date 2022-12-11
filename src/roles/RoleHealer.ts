import { IHealer } from "../types/Healer";

import RoleSolder from "./RoleSolder";

const RoleHealer = {
    ...RoleSolder,
    ...{
        basicParts: [HEAL, HEAL, MOVE],
        defaultSetupT1: [HEAL, MOVE],
        defaultSetupT2: [HEAL, HEAL, MOVE],
        defaultSetupT3: [HEAL, HEAL, TOUGH, MOVE, MOVE],
        roleName: "healer",
        run: function (creep: IHealer) {
            const closestWounded = creep.pos.findClosestByRange(
                FIND_MY_CREEPS,
                {
                    filter: (creep) => creep.hits < creep.hitsMax,
                }
            );
            if (closestWounded) {
                creep.say("Heal");
                if (creep.heal(closestWounded) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestWounded, {
                        visualizePathStyle: { stroke: "#FF0000" },
                    });
                }
            } else {
                if (
                    creep.pos.isNearTo(Game.flags[`${creep.room}-defendPoint`])
                ) {
                    return;
                }
                creep.say("😴 sleep");
                creep.moveToDefendPoint();
            }
        },
    },
};

export default RoleHealer as unknown as IHealer;
