import { IClaimer } from "../types/Claimer";
import { WorkerController } from "./WorkerController";

class ClaimerController extends WorkerController {
    creep: IClaimer;
    static roleName = "claimer";
    static basicParts = null;
    static defaultSetupT1 = <BodyPartConstant[]>[CLAIM, CLAIM, MOVE];

    run() {
        if (!this.creep.room.controller.my) {
            if (this.creep.pos.isNearTo(this.creep.room.controller)) {
                this.creep.claimController(this.creep.room.controller);
            } else {
                this.creep.moveTo(this.creep.room.controller);
            }
        } else {
            const flagName = `${this.creep.room.name}-attackPoint`;
            if (!Game.flags[flagName]) return;

            this.creep.moveTo(Game.flags[flagName]);
        }
    }
}

export { ClaimerController };
