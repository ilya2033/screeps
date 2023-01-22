import { ICreep } from "../types/Creep";

const RoleCreep = {
    roleName: "",

    spawn: function (spawn, basicParts = this.basicParts) {
        let setup = this.defaultSetupT1;

        if (basicParts) {
            const bodyCost = basicParts.reduce(function (cost, part) {
                return cost + BODYPART_COST[part];
            }, 0);
            let energy = spawn.room.energyAvailable;
            setup = [];
            while (energy >= bodyCost) {
                setup = [...setup, ...basicParts];
                energy = energy - bodyCost;
            }
            if (setup.length === 0) {
                basicParts = null;
            }
        }

        if (
            spawn.room.energyAvailable === spawn.room.energyCapacityAvailable &&
            !basicParts
        ) {
            switch (true) {
                case spawn.room.energyAvailable >= 1200:
                    setup = this.defaultSetupT4;
                    break;
                case spawn.room.energyAvailable >= 800:
                    setup = this.defaultSetupT3;
                    break;

                case spawn.room.energyAvailable >= 550:
                    setup = this.defaultSetupT2;
                    break;
            }
        }

        spawn.spawnCreep(
            setup,
            `${this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1)}${
                Game.time
            }`,
            {
                memory: { role: this.roleName, recover: false },
            }
        );
    },

    sleep: function (creep: ICreep) {
        if (this.help(creep)) {
            return;
        }
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);

        if (!creep.pos.isNearTo(spawn)) {
            creep.say("😴 sleep");
            creep.moveTo(spawn);
        }
    },
    refresh: function (creep: ICreep) {
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            creep.moveTo(spawn);
            creep.memory.recover = true;

            return true;
        }

        return false;
    },
};

export default RoleCreep as unknown as ICreep;
