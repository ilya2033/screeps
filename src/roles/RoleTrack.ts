import RoleWorker from "./RoleWorker";
import { ITrack } from "../types/Track";
import conf from "../settings";

const RoleTrack = {
    ...RoleWorker,
    ...{
        roleName: "track",
        basicParts: [CARRY, CARRY, MOVE],
        runLab: function (creep: ITrack) {
            const labs = creep.room.find(FIND_STRUCTURES, {
                filter: (st: Structure) => st.structureType === STRUCTURE_LAB,
            });
            const labsWithFreeStore = labs.filter((lab: StructureLab) =>
                lab.store.getFreeCapacity()
            );
            if (!labs.length) {
                return false;
            }

            if (!creep.room.storage) {
                return false;
            }

            let storageEntries = Object.entries(creep.room.storage.store);

            if (!storageEntries.length) {
                return false;
            }

            storageEntries.filter((resource) =>
                conf.resources.BOOST_CREEPS.includes(
                    resource[0] as ResourceConstant
                )
            );

            const selectedResource: {
                key: ResourceConstant;
                resource: number;
            } = {
                key: storageEntries[0][0] as ResourceConstant,
                resource: storageEntries[0][1],
            };

            const selectedTarget =
                creep.pos.findClosestByPath(labsWithFreeStore);

            if (selectedResource.key === RESOURCE_ENERGY) {
                return false;
            }

            if (creep.store.getFreeCapacity() > 0) {
                if (creep.pos.isNearTo(creep.room.storage)) {
                    creep.withdraw(creep.room.storage, selectedResource.key);
                } else {
                    creep.moveTo(creep.room.storage, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                if (creep.pos.isNearTo(selectedTarget)) {
                    creep.transfer(selectedTarget, selectedResource.key);
                } else {
                    creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
            return true;
        },

        harvestEnergy: function (creep: ITrack) {
            let targets = [];
            let storedSource = null;

            const closestStorage = creep.pos.findClosestByPath(
                creep.findStorages(RESOURCE_ENERGY),
                { filter: (st) => st.store[RESOURCE_ENERGY] > 0 }
            );

            const closestLink =
                creep.memory.role !== "track" &&
                creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (st) =>
                        st.structureType === STRUCTURE_LINK &&
                        st.store[RESOURCE_ENERGY] > 0,
                });

            if (closestLink) {
                targets[targets.length] = closestLink;
            }

            if (closestStorage && !storedSource) {
                targets[targets.length] = closestStorage;
            }
            if (storedSource) {
                targets[targets.length] = storedSource;
            }

            const target = creep.pos.findClosestByPath(targets);

            if (target) {
                if (creep.pos.isNearTo(target)) {
                    if (
                        creep.withdraw(target, RESOURCE_ENERGY) ===
                        ERR_INVALID_TARGET
                    ) {
                        if (creep.pickup(target) === ERR_INVALID_TARGET) {
                            creep.harvest(target);
                        }
                    }
                } else {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
                return true;
            }
            return false;
        },

        runStorage: function (creep: ITrack) {
            if (!creep.room.terminal) {
                return false;
            }
            if (!creep.room.storage) {
                return false;
            }
            if (creep.store.energy > 0) {
                return false;
            }
            let terminalEntries = Object.entries(creep.room.terminal.store);

            if (!terminalEntries.length) {
                return false;
            }

            terminalEntries.sort(
                ([akey, avalue], [bkey, bvalue]) => bvalue - avalue
            );

            const selectedResource: {
                key: ResourceConstant;
                resource: number;
            } = {
                key: terminalEntries[0][0] as ResourceConstant,
                resource: terminalEntries[0][1],
            };

            if (selectedResource.key === RESOURCE_ENERGY) {
                return false;
            }
            if (
                creep.room.storage?.store[selectedResource.key] > 20000 &&
                selectedResource.resource < 20000
            ) {
                return false;
            }

            if (creep.store.getFreeCapacity() > 0) {
                if (creep.pos.isNearTo(creep.room.terminal)) {
                    creep.withdraw(creep.room.terminal, selectedResource.key);
                } else {
                    creep.moveTo(creep.room.terminal, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                if (creep.pos.isNearTo(creep.room.storage)) {
                    creep.transfer(creep.room.storage, selectedResource.key);
                } else {
                    creep.moveTo(creep.room.storage, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
            return true;
        },
        runTerminal: function (creep: ITrack) {
            if (!creep.room.terminal) {
                return false;
            }
            if (!creep.room.storage) {
                return false;
            }

            let storageEntries = Object.entries(creep.room.storage.store);

            if (!storageEntries.length) {
                return false;
            }

            storageEntries.sort(
                ([akey, avalue], [bkey, bvalue]) => bvalue - avalue
            );

            const selectedResource: {
                key: ResourceConstant;
                resource: number;
            } = {
                key: storageEntries[0][0] as ResourceConstant,
                resource: storageEntries[0][1],
            };

            if (selectedResource.key === RESOURCE_ENERGY) {
                return false;
            }

            if (selectedResource.resource < 10000) {
                return false;
            }

            if (creep.room.terminal?.store[selectedResource.key] > 10000) {
                return false;
            }

            if (creep.store.getFreeCapacity() > 0) {
                if (creep.pos.isNearTo(creep.room.storage)) {
                    creep.withdraw(creep.room.storage, selectedResource.key);
                } else {
                    creep.moveTo(creep.room.storage, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            } else {
                if (creep.pos.isNearTo(creep.room.terminal)) {
                    creep.transfer(creep.room.terminal, selectedResource.key);
                } else {
                    creep.moveTo(creep.room.terminal, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
            return true;
        },
        checkOtherResources: function (creep: ITrack) {
            const otherResources: ResourceConstant[] = Object.keys(
                creep.store
            ).filter((res) => res !== RESOURCE_ENERGY) as ResourceConstant[];
            if (!otherResources.length) {
                return;
            }

            const resourceToTransfer = otherResources[0];
            let selectedTarget = null;

            if (creep.room.storage) {
                selectedTarget = creep.room.storage;
            }
            if (!selectedTarget) {
                return false;
            }

            if (creep.pos.isNearTo(selectedTarget)) {
                creep.transfer(
                    selectedTarget,
                    resourceToTransfer,
                    creep.store[resourceToTransfer]
                );
            } else {
                creep.moveTo(selectedTarget, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return 1;
        },
        run: function (creep: ITrack) {
            if (!this.runBasic(creep)) return;
            if (creep.name === creep.room.memory.terminalTrack) {
                if (this.runStorage(creep)) {
                    return;
                }
                if (this.runTerminal(creep)) {
                    return;
                }
            }
            if (this.checkOtherResources(creep)) {
                return;
            }
            // if (this.runLab(creep)) {
            //     return;
            // }

            if (creep.memory.working === undefined) {
                creep.memory.working = true;
            }

            if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.working = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
                creep.memory.working = true;
                creep.say("🚧 work");
            }
            if (!creep.memory.working) {
                this.harvestEnergy(creep);
            } else {
                const targets: Structure[] = creep.store[RESOURCE_ENERGY]
                    ? creep.room.find(FIND_STRUCTURES, {
                          filter: (structure) => {
                              return (
                                  (structure.structureType == STRUCTURE_LAB ||
                                      structure.structureType ==
                                          STRUCTURE_EXTENSION ||
                                      structure.structureType ==
                                          STRUCTURE_SPAWN ||
                                      structure.structureType ==
                                          STRUCTURE_LINK ||
                                      structure.structureType ==
                                          STRUCTURE_TOWER ||
                                      (structure.structureType ==
                                          STRUCTURE_TERMINAL &&
                                          structure.store[RESOURCE_ENERGY] <
                                              5000)) &&
                                  structure.store.getFreeCapacity(
                                      RESOURCE_ENERGY
                                  ) > 0
                              );
                          },
                      })
                    : [];

                const selectedTarget: Structure | null =
                    creep.pos.findClosestByPath(targets);
                if (selectedTarget) {
                    if (creep.pos.isNearTo(selectedTarget)) {
                        creep.transfer(selectedTarget, RESOURCE_ENERGY);
                    } else {
                        creep.moveTo(selectedTarget, {
                            visualizePathStyle: { stroke: "#ffffff" },
                        });
                    }
                }
            }
        },
    },
};

export default RoleTrack as unknown as ITrack;
