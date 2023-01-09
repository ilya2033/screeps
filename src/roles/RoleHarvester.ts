import RoleWorker from "./RoleWorker";
import { IHarvester } from "../types/Harvester";

const RoleHarvester = {
    ...RoleWorker,
    ...{
        roleName: "harvester",
        run: function (creep: IHarvester) {
            this.runBasic(creep);

            const droppedResource = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res) => res.resourceType !== RESOURCE_ENERGY,
            });
            if (droppedResource.length && creep.room.storage) {
                const selectedResourse =
                    creep.pos.findClosestByPath(droppedResource);
                if (creep.pickup(selectedResourse) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(selectedResourse, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
                return true;
            }
            let checkOtherResources = Object.entries(creep.store).filter(
                ([key, value]) => value > 1 && key !== RESOURCE_ENERGY
            ).length;
            if (creep.store.getFreeCapacity() && !checkOtherResources) {
                creep.harvestEnergy();
            } else {
                const targets: Structure[] = creep.store[RESOURCE_ENERGY]
                    ? creep.room.find(FIND_STRUCTURES, {
                          filter: (structure) => {
                              return (
                                  (structure.structureType ==
                                      STRUCTURE_EXTENSION ||
                                      structure.structureType ==
                                          STRUCTURE_SPAWN ||
                                      structure.structureType ==
                                          STRUCTURE_LINK ||
                                      structure.structureType ==
                                          STRUCTURE_TOWER) &&
                                  structure.store.getFreeCapacity(
                                      RESOURCE_ENERGY
                                  ) > 0
                              );
                          },
                      })
                    : [];
                const storages: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (
                            (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType === STRUCTURE_LINK ||
                                structure.structureType ===
                                    STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity() > 0
                        );
                    },
                });
                let selectedTarget: Structure | null = null;
                if (checkOtherResources && creep.room.storage) {
                    selectedTarget = creep.room.storage;
                } else {
                    selectedTarget = storages.length
                        ? creep.pos.findClosestByPath(storages)
                        : creep.pos.findClosestByPath(targets);
                }

                if (selectedTarget) {
                    if (creep.pos.isNearTo(selectedTarget)) {
                        if (
                            selectedTarget.structureType === STRUCTURE_STORAGE
                        ) {
                            console.log(selectedTarget);

                            creep.transfer(
                                selectedTarget,
                                _.findKey(creep.store)
                            );
                        } else {
                            creep.transfer(selectedTarget, RESOURCE_ENERGY);
                        }
                    } else {
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
