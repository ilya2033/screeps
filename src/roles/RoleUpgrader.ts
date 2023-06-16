import conf from "../settings";
import { IUpgrader } from "../types/Upgrader";
import { RoleWorker } from "./RoleWorker";

class RoleUpgrader extends RoleWorker implements IUpgrader {
    roleName = "upgrader";

    run() {
        if (!this.runBasic()) return;

        if (this.memory.working && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.working = false;
            this.say("🔄 harvest");
        }
        if (!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
            this.say("⚡ work");
        }

        if (this.memory.working) {
            if (
                this.room.controller.ticksToDowngrade > 9000 &&
                this.name !== this.room.memory.controlUpgrader
            ) {
                if (this.help()) {
                    return;
                }
                if (this.room.memory.damagedStructures.length) {
                    this.repairStructures();
                } else {
                    this.upgrade();
                }
            } else {
                this.upgrade();
            }
        } else {
            this.harvestEnergy();
        }
    }
}

export { RoleUpgrader };
