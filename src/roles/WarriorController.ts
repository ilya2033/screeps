import { IWarrior } from "../types/Warrior";

import { SolderController } from "./SolderController";

class WarriorController extends SolderController {
    creep: IWarrior;

    static roleName = "warrior";
    static basicParts = <BodyPartConstant[]>[ATTACK, TOUGH, MOVE];
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

    run() {
        const closestHostile =
            this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ||
            this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (st: Structure) =>
                    st.structureType === STRUCTURE_POWER_BANK,
            });

        if (closestHostile) {
            this.creep.say("Attack");
            if (this.creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { WarriorController };
