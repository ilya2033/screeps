const roleWarrior = {
    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            creep.moveToSpawnPoint();
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn) =>
        spawn.spawnCreep([ATTACK, MOVE], `Warrior${Game.time}`, {
            memory: { role: "warrior" },
        }),
};

export default roleWarrior;
