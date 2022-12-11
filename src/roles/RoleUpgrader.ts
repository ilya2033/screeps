import { IUpgrader } from "../types/Upgrader";
import RoleWorker from "./RoleWorker";

const upgrade = (creep: IUpgrader) => {
    if (creep.room.controller) {
        if (
            creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE
        ) {
            creep.moveTo(creep.room.controller, {
                visualizePathStyle: { stroke: "#ffffff" },
            });
        }
    }
};

const repair = (creep: IUpgrader) => {
    const closestDamagedStructure = creep.pos.findClosestByRange(
        creep.room.memory.damagedStructures || []
    );
    if (closestDamagedStructure) {
        if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestDamagedStructure, {
                visualizePathStyle: { stroke: "#ffffff" },
            });
        }
    }
};

const RoleUpgrader = {
    ...RoleWorker,
    ...{
        roleName: "upgrader",
        run: function (creep: IUpgrader) {
            if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
                creep.memory.working = true;
                creep.say("⚡ work");
            }
            if (creep.memory.working) {
                if (
                    creep.room.memory.damagedStructures.length &&
                    !(creep.room.controller.ticksToDowngrade < 3000)
                ) {
                    repair(creep);
                } else {
                    upgrade(creep);
                }
            } else {
                creep.harvestEnergy();
            }
        },
    },
};

export default RoleUpgrader as unknown as IUpgrader;
