import { WorkerController } from "./WorkerController";
import { IBuilder, IBuilderMemory } from "../types/Builder";

class BuilderController extends WorkerController {
    creep: IBuilder;
    static roleName = "builder";

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
            this.creep.say("🚧 work");
        }

        if (this.creep.memory.working) {
            let buildTargets = this.creep.room.find(FIND_CONSTRUCTION_SITES);

            if (!this.creep.help()) {
                if (buildTargets.length) {
                    if (this.creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                        this.creep.moveTo(buildTargets[0], {
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

export { BuilderController };
