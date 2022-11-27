import { IS_FIXING } from "../settings";
const roleRepair = {
    run: function (creep) {
        if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
            creep.memory.repairing = true;
            creep.say("🚧 repair");
        }
        if (creep.memory.repairing) {
            const closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax,
            });
            if (closestDamagedStructure && IS_FIXING) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
        else {
            creep.harvestEnergy();
        }
    },
    spawn: (spawn) => spawn.spawnCreep([WORK, MOVE, CARRY], `Repair${Game.time}`, {
        memory: { role: "Repair" },
    }),
};
export default roleRepair;
