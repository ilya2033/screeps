const roleArcher = {
    run: function (creep: Creep) {
        const closestHostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            creep.say("Attack");
            if (creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestHostile, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            if (creep.pos.isNearTo(Game.flags[`${creep.room}-defendPoint`])) {
                return;
            }
            creep.say("😴 sleep");
            creep.moveToDefendPoint();
        }
    },
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [RANGED_ATTACK, MOVE];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [
                    RANGED_ATTACK,
                    RANGED_ATTACK,
                    RANGED_ATTACK,
                    MOVE,
                    MOVE,
                ];
                break;
        }
        spawn.spawnCreep(setup, `Archer${Game.time}`, {
            memory: { role: "archer" },
        });
    },
};

export default roleArcher;
