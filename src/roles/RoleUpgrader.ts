import conf from "../settings";
import { IUpgrader } from "../types/Upgrader";
import RoleWorker from "./RoleWorker";

const RoleUpgrader = {
    ...RoleWorker,
    ...{
        roleName: "upgrader",
        run: function (creep: IUpgrader) {
            if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
                creep.memory.working = true;
                creep.say("⚡ work");
            }

            if (
                !(creep.room.controller.ticksToDowngrade < 9000) ||
                !this.help(creep)
            ) {
                if (creep.memory.working) {
                    if (
                        creep.room.memory.damagedStructures.length &&
                        !(creep.room.controller.ticksToDowngrade < 9000)
                    ) {
                        this.repair(creep);
                    } else {
                        this.upgrade(creep);
                    }
                } else {
                    creep.harvestEnergy();
                }
            }
        },
    },
};

export default RoleUpgrader as unknown as IUpgrader;
