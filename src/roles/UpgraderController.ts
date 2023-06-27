import { IUpgrader } from "../types/Upgrader";
import { WorkerController } from "./WorkerController";

class UpgraderController extends WorkerController {
    creep: IUpgrader;
    static roleName = "upgrader";

    run() {
        if (!this.runBasic()) return;

        if (
            this.creep.memory.working &&
            this.creep.store[RESOURCE_ENERGY] == 0
        ) {
            this.creep.memory.working = false;
            this.creep.say("🔄 harvest");
        }
        if (
            !this.creep.memory.working &&
            this.creep.store.getFreeCapacity() == 0
        ) {
            this.creep.memory.working = true;
            this.creep.say("⚡ work");
        }

        if (this.creep.memory.working) {
            if (
                this.creep.room.controller.ticksToDowngrade > 9000 &&
                this.creep.name !== this.creep.room.memory.controlUpgrader
            ) {
                if (this.help()) {
                    return;
                }
                if (this.creep.room.memory.damagedStructures.length) {
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

export { UpgraderController };
