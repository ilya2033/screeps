import { ISolder } from "../types/Solder";

const RoleSolder = {
    defaultSetupT1: [ATTACK, TOUGH, MOVE],
    defaultSetupT2: [ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE],
    roleName: "",
    spawn: function (spawn: StructureSpawn, energyCapacityAvailable?: number) {
        let setup = this.defaultSetupT1;
        switch (energyCapacityAvailable) {
            case 550:
                setup = this.defaultSetupT2;
                break;
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
