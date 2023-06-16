import { IClaimer } from "../types/Claimer";
import { RoleWorker } from "./RoleWorker";

class RoleClaimer extends RoleWorker implements IClaimer {
    roleName = "claimer";
    basicParts = null;
    defaultSetupT1 = <BodyPartConstant[]>[CLAIM, CLAIM, MOVE];

    run() {
        if (!this.room.controller.my) {
            if (this.pos.isNearTo(this.room.controller)) {
                this.claimController(this.room.controller);
            } else {
                this.moveTo(this.room.controller);
            }
        } else {
            const flagName = `${this.room.name}-attackPoint`;
            if (!Game.flags[flagName]) return;

            this.moveTo(Game.flags[flagName]);
        }
    }
}

export { RoleClaimer };
