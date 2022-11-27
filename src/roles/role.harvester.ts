import { IHarvester } from "../types/Harvester";

const roleHarvester = {
    run: function (creep: IHarvester) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy();
        } else {
            const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    );
                },
            });

            const selectedTarget: Structure | null =
                creep.pos.findClosestByPath(targets);

            if (selectedTarget) {
                if (
                    creep.transfer(selectedTarget, RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [WORK, MOVE, CARRY];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [WORK, WORK, WORK, MOVE, MOVE, CARRY];
                break;
        }
        spawn.spawnCreep(setup, `Harvester${Game.time}`, {
            memory: { role: "harvester" },
        });
    },
};

export default roleHarvester;
