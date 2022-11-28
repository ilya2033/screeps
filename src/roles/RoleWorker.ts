import { IWorker } from "../types/Worker";

class RoleWorker extends Creep implements IWorker {
    static #defaultSetupT1 = [WORK, MOVE, CARRY];
    static #defaultSetupT2 = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
    static #roleName = "worker";

    static spawn = (
        spawn: StructureSpawn,
        energyCapacityAvailable?: number
    ) => {
        let setup = this.#defaultSetupT1;
        switch (energyCapacityAvailable) {
            case 550:
                setup = this.#defaultSetupT2;
                break;
        }
        spawn.spawnCreep(
            setup,
            `${
                this.#roleName.charAt(0).toUpperCase() + this.#roleName.slice(1)
            }${Game.time}`,
            {
                memory: { role: this.#roleName },
            }
        );
    };

    static sleep(creep: IWorker) {
        if (creep.pos.isNearTo(Game.flags[`${creep.room}-spawnPoint`])) {
            return;
        }
        creep.say("😴 sleep");
        creep.moveToSpawnPoint();
    }
}

export default RoleWorker;
