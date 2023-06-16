import { IHealer } from "../types/Healer";
import { SolderController } from "./SolderController";

class HealerController extends SolderController {
    creep: IHealer;
    static roleName = "healer";
    static basicParts = <BodyPartConstant[]>[HEAL, HEAL, MOVE];
    static defaultSetupT1 = <BodyPartConstant[]>[HEAL, MOVE];
    static defaultSetupT2 = <BodyPartConstant[]>[HEAL, HEAL, MOVE];
    static defaultSetupT3 = <BodyPartConstant[]>[HEAL, HEAL, TOUGH, MOVE, MOVE];

    run() {
        const closestWounded = this.creep.pos.findClosestByRange(
            FIND_MY_CREEPS,
            {
                filter: () => this.creep.hits < this.creep.hitsMax,
            }
        );
        if (closestWounded) {
            this.creep.say("Heal");
            if (this.creep.heal(closestWounded) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestWounded, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { HealerController };
