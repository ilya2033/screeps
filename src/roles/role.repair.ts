import settings from "../settings";
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
                creep.say("😴 sleep");
                creep.moveToSpawnPoint();
            }
        } else {
            creep.harvestEnergy();
        }
    },
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [WORK, MOVE, CARRY];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [WORK, WORK, WORK, MOVE, MOVE, CARRY];
                break;
        }
        spawn.spawnCreep(setup, `Repair${Game.time}`, {
            memory: { role: "repair" },
        });
    },
};

export default roleRepair;
