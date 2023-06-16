import { WorkerController } from "./WorkerController";
import { ITrack } from "../types/Track";
import conf from "../settings";

class TrackController extends WorkerController {
    creep: ITrack;

    static roleName = "track";
    static basicParts = <BodyPartConstant[]>[CARRY, CARRY, MOVE];

    runLab() {
        const labs = this.creep.room.find(FIND_STRUCTURES, {
            filter: (st: Structure) => st.structureType === STRUCTURE_LAB,
        });
        const labsWithFreeStore = labs.filter((lab: StructureLab) =>
            lab.store.getFreeCapacity()
        );
        if (!labs.length) {
            return false;
        }

        if (!this.creep.room.storage) {
            return false;
        }

        let storageEntries = Object.entries(this.creep.room.storage.store);

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
            this.creep.pos.findClosestByPath(labsWithFreeStore);

        if (selectedResource.key === RESOURCE_ENERGY) {
            return false;
        }

        if (this.creep.store.getFreeCapacity() > 0) {
            if (this.creep.pos.isNearTo(this.creep.room.storage)) {
                this.creep.withdraw(
                    this.creep.room.storage,
                    selectedResource.key
                );
            } else {
                this.creep.moveTo(this.creep.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.creep.pos.isNearTo(selectedTarget)) {
                this.creep.transfer(selectedTarget, selectedResource.key);
            } else {
                this.creep.moveTo(selectedTarget, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }

    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        const closestStorage = this.creep.pos.findClosestByPath(
            this.creep.findStorages(),
            {
                filter: (st) => st.store[RESOURCE_ENERGY] > 0,
            }
        );

        const closestLink =
            this.creep.memory.role !== "track" &&
            this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
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

        const target = this.creep.pos.findClosestByPath(targets);

        if (target) {
            if (this.creep.pos.isNearTo(target)) {
                if (
                    this.creep.withdraw(target, RESOURCE_ENERGY) ===
                    ERR_INVALID_TARGET
                ) {
                    if (this.creep.pickup(target) === ERR_INVALID_TARGET) {
                        this.creep.harvest(target);
                    }
                }
            } else {
                this.creep.moveTo(target, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return true;
        }
        return false;
    }

    runStorage() {
        if (!this.creep.room.terminal) {
            return false;
        }
        if (!this.creep.room.storage) {
            return false;
        }
        if (this.creep.store.energy > 0) {
            return false;
        }
        let terminalEntries = Object.entries(this.creep.room.terminal.store);

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
            this.creep.room.storage?.store[selectedResource.key] > 20000 &&
            selectedResource.resource < 20000
        ) {
            return false;
        }

        if (this.creep.store.getFreeCapacity() > 0) {
            if (this.creep.pos.isNearTo(this.creep.room.terminal)) {
                this.creep.withdraw(
                    this.creep.room.terminal,
                    selectedResource.key
                );
            } else {
                this.creep.moveTo(this.creep.room.terminal, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.creep.pos.isNearTo(this.creep.room.storage)) {
                this.creep.transfer(
                    this.creep.room.storage,
                    selectedResource.key
                );
            } else {
                this.creep.moveTo(this.creep.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }
    runTerminal() {
        if (!this.creep.room.terminal) {
            return false;
        }
        if (!this.creep.room.storage) {
            return false;
        }

        let storageEntries = Object.entries(this.creep.room.storage.store);

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

        if (this.creep.room.terminal?.store[selectedResource.key] > 10000) {
            return false;
        }

        if (this.creep.store.getFreeCapacity() > 0) {
            if (this.creep.pos.isNearTo(this.creep.room.storage)) {
                this.creep.withdraw(
                    this.creep.room.storage,
                    selectedResource.key
                );
            } else {
                this.creep.moveTo(this.creep.room.storage, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        } else {
            if (this.creep.pos.isNearTo(this.creep.room.terminal)) {
                this.creep.transfer(
                    this.creep.room.terminal,
                    selectedResource.key
                );
            } else {
                this.creep.moveTo(this.creep.room.terminal, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
        }
        return true;
    }

    checkOtherResources() {
        const otherResources: ResourceConstant[] = Object.keys(
            this.creep.store
        ).filter((res) => res !== RESOURCE_ENERGY) as ResourceConstant[];
        if (!otherResources.length) {
            return;
        }

        const resourceToTransfer = otherResources[0];
        let selectedTarget = null;

        if (this.creep.room.storage) {
            selectedTarget = this.creep.room.storage;
        }
        if (!selectedTarget) {
            return false;
        }

        if (this.creep.pos.isNearTo(selectedTarget)) {
            this.creep.transfer(
                selectedTarget,
                resourceToTransfer,
                this.creep.store[resourceToTransfer]
            );
        } else {
            this.creep.moveTo(selectedTarget, {
                visualizePathStyle: { stroke: "#ffffff" },
            });
        }
        return 1;
    }

    run() {
        if (!this.runBasic()) return;
        if (this.creep.name === this.creep.room.memory.terminalTrack) {
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
        // if (this.creep.runLab(this)) {
        //     return;
        // }

        if (this.creep.memory.working === undefined) {
            this.creep.memory.working = true;
        }

        if (
            this.creep.memory.working &&
            this.creep.store[RESOURCE_ENERGY] == 0
        ) {
            this.creep.memory.working = false;
            this.creep.say("🔄 harvest");
        }
        if (
            !this.creep.memory.working &&
            this.creep.store.getFreeCapacity() == 0
        ) {
            this.creep.memory.working = true;
            this.creep.say("🚧 work");
        }
        if (!this.creep.memory.working) {
            this.creep.harvestEnergy();
        } else {
            const targets: Structure[] = this.creep.store[RESOURCE_ENERGY]
                ? this.creep.room.find(FIND_STRUCTURES, {
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
                this.creep.pos.findClosestByPath(targets);
            if (selectedTarget) {
                if (this.creep.pos.isNearTo(selectedTarget)) {
                    this.creep.transfer(selectedTarget, RESOURCE_ENERGY);
                } else {
                    this.creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }
        }
    }
}

export { TrackController };
