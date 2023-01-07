import RoleWorker from "./RoleWorker";
import { IBuilder } from "../types/Builder";

const RoleBuilder = {
    ...RoleWorker,
    ...{
        roleName: "builder",
        run: function (creep: IBuilder) {
            if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.building = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
                creep.memory.building = true;
                creep.say("🚧 build");
            }

            if (creep.memory.building) {
                let buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);

                if (!this.help(creep)) {
                    if (buildTargets.length) {
                        if (creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(buildTargets[0], {
                                visualizePathStyle: { stroke: "#ffffff" },
                            });
                        }
                    } else {
                        if (!this.repair(creep)) {
                            this.sleep(creep);
                        }
                    }
                }
            } else {
                creep.harvestEnergy();
            }
        },
    },
};

export default RoleBuilder as unknown as IBuilder;
