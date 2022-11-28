import { IUpgrader } from "../types/Upgrader";
import RoleWorker from "./RoleWorker";

const RoleUpgrader = {
    ...RoleWorker,
    ...{
        roleName: "upgrader",
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
    },
};

export default RoleUpgrader as unknown as IUpgrader;
