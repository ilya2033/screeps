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

            if (buildTargets.length) {
                if (creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildTargets[0], {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                if (
                    creep.pos.isNearTo(Game.flags[`${creep.room}-spawnPoint`])
                ) {
                    return;
                }
                creep.say("😴 sleep");
                creep.moveToSpawnPoint();
            }
        } else {
            creep.harvestEnergy();
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [WORK, MOVE, CARRY];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
        }
        spawn.spawnCreep(setup, `Builder${Game.time}`, {
            memory: { role: "builder" },
        });
    },
};

export default roleBuilder;
