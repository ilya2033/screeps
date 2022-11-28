import { IWorker } from "../types/Worker";

const RoleWorker = {
    defaultSetupT1: [WORK, MOVE, CARRY],
    defaultSetupT2: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
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

    sleep: function (creep: IWorker) {
        if (creep.pos.isNearTo(Game.flags[`${creep.room}-spawnPoint`])) {
            return;
        }
        creep.say("😴 sleep");
        creep.moveToSpawnPoint();
    },
};

export default RoleWorker as unknown as IWorker;
