const roleArcher = {
    run: function (creep: Creep) {
        const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            creep.say("Attack");
            if (creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            creep.say("😴 sleep");
            creep.moveToSpawnPoint();
        }
    },
    spawn: (spawn) =>
        spawn.spawnCreep([RANGED_ATTACK, MOVE], `Archer${Game.time}`, {
            memory: { role: "archer" },
        }),
};

export default roleArcher;