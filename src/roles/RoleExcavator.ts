import { RoleWorker } from "./RoleWorker";
import { IExcavator } from "../types/Excavator";

class RoleExcavator extends RoleWorker implements IExcavator {
    roleName = "excavator";
    run() {
        if (!this.runBasic()) return;
        const selectedTarget = this.room.storage;
        if (this.store.getFreeCapacity()) {
            this.harvestMinerals();
        } else {
            if (selectedTarget) {
                if (this.pos.isNearTo(selectedTarget)) {
                    this.transfer(
                        selectedTarget,
                        //@ts-ignore
                        _.findKey(this.store)
                    );
                } else {
                    this.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }

        if (!selectedTarget && this.store.getFreeCapacity() === 0) {
            if (!this.repairStructures()) {
                this.sleep();
            }
        }
    }
}

export { RoleExcavator };
