import { IUpgrader } from "../types/Upgrader";

const roleUpgrader = {
    /** @param {Creep} creep **/
    run: function (creep: IUpgrader) {
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say("🔄 harvest");
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say("⚡ upgrade");
        }

        if (creep.memory.upgrading && creep.room.controller) {
            if (
                creep.upgradeController(creep.room.controller) ==
                ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            creep.harvestEnergy();
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn: StructureSpawn, energyCapacityAvailable?: number) => {
        let setup = [WORK, MOVE, CARRY];
        switch (energyCapacityAvailable) {
            case 550:
                setup = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
                break;
        }
        spawn.spawnCreep(setup, `Upgrader${Game.time}`, {
            memory: { role: "upgrader" },
        });
    },
};

export default roleUpgrader;
