import { IClaimer } from "../types/Claimer";
import RoleWorker from "./RoleWorker";

const RoleClaimer = {
    ...RoleWorker,
    ...{
        defaultSetupT1: [CLAIM, CLAIM, MOVE],
        basicParts: null,
        roleName: "claimer",
        run: function (creep: IClaimer) {
            if (!creep.room.controller.my) {
                if (creep.pos.isNearTo(creep.room.controller)) {
                    creep.claimController(creep.room.controller);
                } else {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                const flagName = `${creep.room.name}-attackPoint`;
                if (!Game.flags[flagName]) return;

                creep.moveTo(Game.flags[flagName]);
            }
        },
    },
};

export default RoleClaimer as unknown as IClaimer;
