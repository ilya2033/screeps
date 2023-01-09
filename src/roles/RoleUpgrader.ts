import conf from "../settings";
import { IUpgrader } from "../types/Upgrader";
import RoleWorker from "./RoleWorker";

const RoleUpgrader = {
    ...RoleWorker,
    ...{
        roleName: "upgrader",
        run: function (creep: IUpgrader) {
            this.runBasic(creep);

            if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
                creep.memory.working = true;
                creep.say("⚡ work");
            }

            if (creep.memory.working) {
                if (
                    creep.room.controller.ticksToDowngrade > 9000 &&
                    creep.name !== creep.room.memory.controlUpgrader
                ) {
                    if (this.help(creep)) {
                        return;
                    }
                    if (creep.room.memory.damagedStructures.length) {
                        this.repair(creep);
                    } else {
                        this.upgrade(creep);
                    }
                } else {
                    this.upgrade(creep);
                }
            } else {
                creep.harvestEnergy();
            }
        },
    },
};

export default RoleUpgrader as unknown as IUpgrader;
