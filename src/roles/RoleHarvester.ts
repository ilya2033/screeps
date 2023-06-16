import { RoleWorker } from "./RoleWorker";
import { IHarvester } from "../types/Harvester";
import { IWorker } from "../types/Worker";

class RoleHarvester extends RoleWorker implements IWorker {
    roleName = "harvester";

    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        storedSource = <Source | null>(
            Game.getObjectById(<Id<_HasId>>this.memory.sourceId || null)
        );

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource)) ||
            storedSource.room.name !== this.room.name ||
            storedSource.energy === 0
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
        }

        const closestDroppedEnergy = this.pos.findClosestByPath(
            FIND_DROPPED_RESOURCES,
            {
                filter: (r: Resource) =>
                    r.resourceType == RESOURCE_ENERGY &&
                    r.amount > 0 &&
                    r.pos.getOpenPositions().length,
            }
        );

        const closestRuinEnergy = this.pos.findClosestByPath(FIND_RUINS, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });

        const closestTombEnergy = this.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });
        if (closestDroppedEnergy || closestRuinEnergy || closestTombEnergy) {
            targets[targets.length] =
                closestDroppedEnergy || closestRuinEnergy || closestTombEnergy;
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
    run() {
        let selectedTarget: Structure | null = null;

        if (!this.runBasic()) return;

        const droppedResource = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: (res) => res.resourceType !== RESOURCE_ENERGY,
        });
        if (
            droppedResource.length &&
            this.room.storage &&
            this.store.getFreeCapacity() > 1
        ) {
            const selectedResourse =
                this.pos.findClosestByPath(droppedResource);
            if (this.pickup(selectedResourse) == ERR_NOT_IN_RANGE) {
                this.moveTo(selectedResourse, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        }
        let checkOtherResources = Object.entries(this.store).filter(
            ([key, value]) => value > 1 && key !== RESOURCE_ENERGY
        ).length;

        if (this.store.getFreeCapacity() && !checkOtherResources) {
            if (!this.harvestEnergy()) {
                this.harvestFromOtherRooms();
                return;
            }
        } else {
            if (!this.room.controller?.my) {
                this.moveHome();
            }
            const targets: Structure[] = this.store[RESOURCE_ENERGY]
                ? this.room.find(FIND_STRUCTURES, {
                      filter: (structure) => {
                          return (
                              (structure.structureType == STRUCTURE_EXTENSION ||
                                  structure.structureType == STRUCTURE_SPAWN ||
                                  structure.structureType == STRUCTURE_LINK ||
                                  structure.structureType == STRUCTURE_TOWER) &&
                              structure.store.getFreeCapacity(RESOURCE_ENERGY) >
                                  0
                          );
                      },
                  })
                : [];
            const storages: Structure[] = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (
                        (structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType === STRUCTURE_LINK ||
                            structure.structureType === STRUCTURE_CONTAINER) &&
                        structure.store.getFreeCapacity() > 0
                    );
                },
            });
            if (checkOtherResources && this.room.storage) {
                selectedTarget = this.room.storage;
            } else {
                selectedTarget = storages.length
                    ? this.pos.findClosestByPath(storages)
                    : this.pos.findClosestByPath(targets);
            }

            if (selectedTarget) {
                if (this.pos.isNearTo(selectedTarget)) {
                    if (selectedTarget.structureType === STRUCTURE_STORAGE) {
                        this.transfer(
                            selectedTarget,
                            //@ts-ignore
                            _.findKey(this.store),
                            //@ts-ignore
                            this.store[_.findKey(this.store)]
                        );
                    } else {
                        this.transfer(selectedTarget, RESOURCE_ENERGY);
                    }
                } else {
                    this.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }

            if (!selectedTarget && this.store.getFreeCapacity() === 0) {
                if (!this.repairStructures()) {
                    this.sleep();
                }
            }
        }
    }
}

export { RoleHarvester };
