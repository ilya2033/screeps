const roleHealer = {
    run: function (creep: Creep) {
        const closestWounded = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax,
        });
        if (closestWounded) {
            creep.say("Heal");
            if (creep.heal(closestWounded) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestWounded, {
                    visualizePathStyle: { stroke: "#FF0000" },
                });
            }
        } else {
            if (creep.pos.isNearTo(Game.flags[`${creep.room}-spawnPoint`])) {
                return;
            }
            creep.say("😴 sleep");
            creep.moveToDefendPoint();
        }
    },
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [HEAL, MOVE];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [HEAL, HEAL, MOVE];
                break;
        }
        spawn.spawnCreep(setup, `Healer${Game.time}`, {
            memory: { role: "healer" },
        });
    },
};

export default roleHealer;
