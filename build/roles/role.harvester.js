const roleHarvester = {
    run: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            creep.harvestEnergy();
        }
        else {
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                },
            });
            const selectedTarget = creep.pos.findClosestByPath(targets);
            if (selectedTarget) {
                if (creep.transfer(selectedTarget, RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE) {
                    creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn) => {
        spawn.spawnCreep([WORK, MOVE, CARRY], `Harvester${Game.time}`, {
            memory: { role: "harvester" },
        });
    },
};
export default roleHarvester;
