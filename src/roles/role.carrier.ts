import { ICarrier } from "../types/Сarrier";

const roleCarrier = {
    run: function (creep: ICarrier, resourceType: ResourceConstant) {
        const storage = creep.findStorage(resourceType);
        if (creep.store.getFreeCapacity() > 0 && storage) {
            creep.withdraw(storage, resourceType);
        } else {
            const selectedTarget = creep.findStorage();

            if (selectedTarget) {
                if (
                    creep.transfer(selectedTarget, RESOURCE_ENERGY) ==
                    ERR_NOT_IN_RANGE
                ) {
                    creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    },
    /** @param {StructureSpawn} spawn **/
    spawn: (spawn) => {
        spawn.spawnCreep([MOVE, CARRY], `Carrier${Game.time}`, {
            memory: { role: "carrier" },
        });
    },
};

export default roleCarrier;
