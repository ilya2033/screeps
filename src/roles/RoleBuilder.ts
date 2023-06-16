import { RoleWorker } from "./RoleWorker";
import { IBuilder, IBuilderMemory } from "../types/Builder";

class RoleBuilder extends RoleWorker implements IBuilder {
    roleName = "builder";
    memory: IBuilderMemory;
    run() {
        if (!this.runBasic()) return;

        if (this.memory.working && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.working = false;
            this.say("🔄 harvest");
        }
        if (!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
            this.say("🚧 work");
        }

        if (this.memory.working) {
            let buildTargets = this.room.find(FIND_CONSTRUCTION_SITES);

            if (!this.help()) {
                if (buildTargets.length) {
                    if (this.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                        this.moveTo(buildTargets[0], {
                            visualizePathStyle: { stroke: "#ffffff" },
                        });
                    }
                } else {
                    this.sleep();
                }
            }
        } else {
            this.harvestEnergy();
        }
    }
}

export { RoleBuilder };
