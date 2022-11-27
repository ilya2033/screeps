import settings from "../settings";
import { IBuilder } from "../types/Builder";

const roleBuilder = {
    /** @param {Creep} creep **/
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
            const buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);

            const closestDamagedStructure = creep.pos.findClosestByRange(
                FIND_STRUCTURES,
                {
                    filter: (structure) => structure.hits < structure.hitsMax,
                }
            );

            if (closestDamagedStructure && settings.global.IS_FIXING) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }

            if (buildTargets.length) {
                if (creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildTargets[0], {
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
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn) =>
        spawn.spawnCreep([WORK, MOVE, CARRY], `Builder${Game.time}`, {
            memory: { role: "builder" },
        }),
};

export default roleBuilder;
