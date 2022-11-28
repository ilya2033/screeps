import { IRepair } from "../types/Repair";

import RoleWorker from "./RoleWorker";
import settings from "../settings";

class RoleRepair extends RoleWorker implements IRepair {
    static #roleName = "repair";

    static run = (creep: IRepair) => {
        const freeCapacity = creep.store.getFreeCapacity();
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.repairing && freeCapacity == 0) {
            creep.memory.repairing = true;
            creep.say("🚧 repair");
        }

        if (creep.memory.repairing) {
            const closestDamagedStructure = creep.pos.findClosestByRange(
                FIND_STRUCTURES,
                {
                    filter: (structure) =>
                        structure.hitsMax - structure.hits >
                            creep.store.getCapacity() &&
                        structure.structureType !== STRUCTURE_WALL,
                }
            );

            if (closestDamagedStructure && settings.global.IS_FIXING) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                this.sleep(creep);
            }
        } else {
            creep.harvestEnergy();
        }
    };
}

export default RoleRepair;
