import { IArcher } from "../types/Archer";
import { SolderController } from "./SolderController";

class ArcherController extends SolderController {
    creep: IArcher;

    static roleName = "archer";
    static basicParts = [RANGED_ATTACK, TOUGH, MOVE];
    static defaultSetupT1 = [RANGED_ATTACK, TOUGH, MOVE];
    static defaultSetupT2 = [
        RANGED_ATTACK,
        RANGED_ATTACK,
        RANGED_ATTACK,
        MOVE,
        MOVE,
    ];
    static defaultSetupT3 = [
        RANGED_ATTACK,
        RANGED_ATTACK,
        RANGED_ATTACK,
        RANGED_ATTACK,
        MOVE,
        MOVE,
    ];

    run() {
        const closestHostile =
            this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            this.creep.say("Attack");
            if (this.creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { ArcherController };
