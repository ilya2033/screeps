import { ISolder } from "../types/Solder";

const RoleSolder = {
    defaultSetupT1: [ATTACK, TOUGH, MOVE],
    defaultSetupT2: [ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE],
    defaultSetupT3: [
        ATTACK,
        ATTACK,
        ATTACK,
        ATTACK,
        TOUGH,
        TOUGH,
        TOUGH,
        TOUGH,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
    ],
    roleName: "",
    spawn: function (spawn: StructureSpawn, basicParts = this.basicParts) {
        let setup = this.defaultSetupT1;
        if (spawn.room.energyAvailable === spawn.room.energyCapacityAvailable) {
            switch (true) {
                case spawn.room.energyAvailable >= 800:
                    setup = this.defaultSetupT2;
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
                memory: { role: this.roleName },
            }
        );
    },

    sleep: function (creep: ISolder) {
        if (creep.pos.isNearTo(Game.flags[`${creep.room}-defendPoint`])) {
            return;
        }
        creep.say("😴 sleep");
        creep.moveToDefendPoint();
    },
};

export default RoleSolder as unknown as ISolder;
