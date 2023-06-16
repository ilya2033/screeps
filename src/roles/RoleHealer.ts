import { IHealer } from "../types/Healer";
import { RoleSolder } from "./RoleSolder";

class RoleHealer extends RoleSolder implements IHealer {
    roleName = "healer";
    basicParts = <BodyPartConstant[]>[HEAL, HEAL, MOVE];
    defaultSetupT1 = <BodyPartConstant[]>[HEAL, MOVE];
    defaultSetupT2 = <BodyPartConstant[]>[HEAL, HEAL, MOVE];
    defaultSetupT3 = <BodyPartConstant[]>[HEAL, HEAL, TOUGH, MOVE, MOVE];

    run() {
        const closestWounded = this.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: () => this.hits < this.hitsMax,
        });
        if (closestWounded) {
            this.say("Heal");
            if (this.heal(closestWounded) == ERR_NOT_IN_RANGE) {
                this.moveTo(closestWounded, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            this.sleep();
        }
    }
}

export { RoleHealer };
