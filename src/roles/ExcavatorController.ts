import { WorkerController } from "./WorkerController";
import { IExcavator } from "../types/Excavator";

class ExcavatorController extends WorkerController {
    creep: IExcavator;
    static roleName = "excavator";

    run() {
        if (!this.runBasic()) return;
        const selectedTarget = this.creep.room.storage;
        if (this.creep.store.getFreeCapacity()) {
            this.creep.harvestMinerals();
        } else {
            if (selectedTarget) {
                if (this.creep.pos.isNearTo(selectedTarget)) {
                    this.creep.transfer(
                        selectedTarget,
                        //@ts-ignore
                        _.findKey(this.creep.store)
                    );
                } else {
                    this.creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }

        if (!selectedTarget && this.creep.store.getFreeCapacity() === 0) {
            if (!this.creep.repairStructures()) {
                this.sleep();
            }
        }
    }
}

export { ExcavatorController };
