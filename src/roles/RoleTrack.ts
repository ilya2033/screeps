import { RoleWorker } from "./RoleWorker";
import { ITrack } from "../types/Track";
import conf from "../settings";

class RoleTrack extends RoleWorker implements ITrack {
    roleName = "track";
    basicParts = <BodyPartConstant[]>[CARRY, CARRY, MOVE];

    runLab() {
        const labs = this.room.find(FIND_STRUCTURES, {
            filter: (st: Structure) => st.structureType === STRUCTURE_LAB,
        });
        const labsWithFreeStore = labs.filter((lab: StructureLab) =>
            lab.store.getFreeCapacity()
        );
        if (!labs.length) {
            return false;
        }

        if (!this.room.storage) {
            return false;
        }

        let storageEntries = Object.entries(this.room.storage.store);

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

        const selectedTarget = this.pos.findClosestByPath(labsWithFreeStore);

        if (selectedResource.key === RESOURCE_ENERGY) {
            return false;
        }

        if (this.store.getFreeCapacity() > 0) {
            if (this.pos.isNearTo(this.room.storage)) {
                this.withdraw(this.room.storage, selectedResource.key);
            } else {
                this.moveTo(this.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.pos.isNearTo(selectedTarget)) {
                this.transfer(selectedTarget, selectedResource.key);
            } else {
                this.moveTo(selectedTarget, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }

    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        const closestStorage = this.pos.findClosestByPath(this.findStorages(), {
            filter: (st) => st.store[RESOURCE_ENERGY] > 0,
        });

        const closestLink =
            this.memory.role !== "track" &&
            this.pos.findClosestByPath(FIND_STRUCTURES, {
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

        const target = this.pos.findClosestByPath(targets);

        if (target) {
            if (this.pos.isNearTo(target)) {
                if (
                    this.withdraw(target, RESOURCE_ENERGY) ===
                    ERR_INVALID_TARGET
                ) {
                    if (this.pickup(target) === ERR_INVALID_TARGET) {
                        this.harvest(target);
                    }
                }
            } else {
                this.moveTo(target, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return true;
        }
        return false;
    }

    runStorage() {
        if (!this.room.terminal) {
            return false;
        }
        if (!this.room.storage) {
            return false;
        }
        if (this.store.energy > 0) {
            return false;
        }
        let terminalEntries = Object.entries(this.room.terminal.store);

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
            this.room.storage?.store[selectedResource.key] > 20000 &&
            selectedResource.resource < 20000
        ) {
            return false;
        }

        if (this.store.getFreeCapacity() > 0) {
            if (this.pos.isNearTo(this.room.terminal)) {
                this.withdraw(this.room.terminal, selectedResource.key);
            } else {
                this.moveTo(this.room.terminal, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.pos.isNearTo(this.room.storage)) {
                this.transfer(this.room.storage, selectedResource.key);
            } else {
                this.moveTo(this.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }
    runTerminal() {
        if (!this.room.terminal) {
            return false;
        }
        if (!this.room.storage) {
            return false;
        }

        let storageEntries = Object.entries(this.room.storage.store);

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

        if (this.room.terminal?.store[selectedResource.key] > 10000) {
            return false;
        }

        if (this.store.getFreeCapacity() > 0) {
            if (this.pos.isNearTo(this.room.storage)) {
                this.withdraw(this.room.storage, selectedResource.key);
            } else {
                this.moveTo(this.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.pos.isNearTo(this.room.terminal)) {
                this.transfer(this.room.terminal, selectedResource.key);
            } else {
                this.moveTo(this.room.terminal, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }

    checkOtherResources() {
        const otherResources: ResourceConstant[] = Object.keys(
            this.store
        ).filter((res) => res !== RESOURCE_ENERGY) as ResourceConstant[];
        if (!otherResources.length) {
            return;
        }

        const resourceToTransfer = otherResources[0];
        let selectedTarget = null;

        if (this.room.storage) {
            selectedTarget = this.room.storage;
        }
        if (!selectedTarget) {
            return false;
        }

        if (this.pos.isNearTo(selectedTarget)) {
            this.transfer(
                selectedTarget,
                resourceToTransfer,
                this.store[resourceToTransfer]
            );
        } else {
            this.moveTo(selectedTarget, {
                visualizePathStyle: { stroke: "#ffffff" },
            });
        }
        return 1;
    }
    run() {
        if (!this.runBasic()) return;
        if (this.name === this.room.memory.terminalTrack) {
            if (this.runStorage()) {
                return;
            }
            if (this.runTerminal()) {
                return;
            }
        }
        if (this.checkOtherResources()) {
            return;
        }
        // if (this.runLab(this)) {
        //     return;
        // }

        if (this.memory.working === undefined) {
            this.memory.working = true;
        }

        if (this.memory.working && this.store[RESOURCE_ENERGY] == 0) {
            this.memory.working = false;
            this.say("🔄 harvest");
        }
        if (!this.memory.working && this.store.getFreeCapacity() == 0) {
            this.memory.working = true;
            this.say("🚧 work");
        }
        if (!this.memory.working) {
            this.harvestEnergy();
        } else {
            const targets: Structure[] = this.store[RESOURCE_ENERGY]
                ? this.room.find(FIND_STRUCTURES, {
                      filter: (structure) => {
                          return (
                              (structure.structureType == STRUCTURE_LAB ||
                                  structure.structureType ==
                                      STRUCTURE_EXTENSION ||
                                  structure.structureType == STRUCTURE_SPAWN ||
                                  structure.structureType == STRUCTURE_LINK ||
                                  structure.structureType == STRUCTURE_TOWER ||
                                  (structure.structureType ==
                                      STRUCTURE_TERMINAL &&
                                      structure.store[RESOURCE_ENERGY] <
                                          5000)) &&
                              structure.store.getFreeCapacity(RESOURCE_ENERGY) >
                                  0
                          );
                      },
                  })
                : [];

            const selectedTarget: Structure | null =
                this.pos.findClosestByPath(targets);
            if (selectedTarget) {
                if (this.pos.isNearTo(selectedTarget)) {
                    this.transfer(selectedTarget, RESOURCE_ENERGY);
                } else {
                    this.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    }
}

export { RoleTrack };
