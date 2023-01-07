import RoleWorker from "./RoleWorker";
import { IHarvester } from "../types/Harvester";

const RoleHarvester = {
    ...RoleWorker,
    ...{
        roleName: "harvester",
        run: function (creep: IHarvester) {
            if (creep.store.energy === 0) {
                creep.harvestEnergy();
            } else {
                const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_LINK ||
                                structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        );
                    },
                });
                const storages: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            structure.structureType == STRUCTURE_STORAGE &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        );
                    },
                });

                const selectedTarget: Structure | null = targets.length
                    ? creep.pos.findClosestByPath(targets)
                    : creep.pos.findClosestByPath(storages);

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

                if (!selectedTarget && creep.store.getFreeCapacity() === 0) {
                    if (!this.repair(creep)) {
                        this.sleep(creep);
                    }
                }
            }
        },
    },
};

export default RoleHarvester as unknown as IHarvester;
