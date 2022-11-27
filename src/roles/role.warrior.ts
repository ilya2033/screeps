const roleWarrior = {
    /** @param {Creep} creep **/
    run: function (creep: Creep) {
        const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        console.log("test");
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
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [ATTACK, MOVE];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [
                    ATTACK,
                    ATTACK,
                    ATTACK,
                    ATTACK,
                    ATTACK,
                    MOVE,
                    MOVE,
                    MOVE,
                ];
                break;
        }
        spawn.spawnCreep(setup, `Warrior${Game.time}`, {
            memory: { role: "warrior" },
        });
    },
};

export default roleWarrior;
