import { IS_FIXING } from "../settings";
import { IRepair } from "../types/Repair";

const roleRepair = {
    run: function (creep: IRepair) {
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
                    filter: (structure) => structure.hits < structure.hitsMax,
                }
            );

            if (closestDamagedStructure && IS_FIXING) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                creep.moveToSpawnPoint();
            }
        } else {
            creep.harvestEnergy();
        }
    },
    spawn: (spawn) =>
        spawn.spawnCreep([WORK, MOVE, CARRY], `Repair${Game.time}`, {
            memory: { role: "repair" },
        }),
};

export default roleRepair;
