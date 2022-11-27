const roleWarrior = {
    /** @param {Creep} creep **/
    run: function (creep) {
        const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        }
        else {
            creep.moveTo(Game.flags[`${creep.room}-spawnPoint`]);
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn) => spawn.spawnCreep([ATTACK, MOVE], `Warrior${Game.time}`, {
        memory: { role: "warrior" },
    }),
};
export default roleWarrior;
