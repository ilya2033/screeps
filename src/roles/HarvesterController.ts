import { WorkerController } from "./WorkerController";
import { IHarvester } from "../types/Harvester";

class HarvesterController extends WorkerController {
    creep: IHarvester;
    static roleName = "harvester";

    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        storedSource = <Source | null>(
            Game.getObjectById(<Id<_HasId>>this.creep.memory.sourceId || null)
        );

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.creep.pos.isNearTo(storedSource)) ||
            storedSource.room.name !== this.creep.room.name ||
            storedSource.energy === 0
        ) {
            delete this.creep.memory.sourceId;
            storedSource = this.findEnergySource();
        }

        const closestDroppedEnergy = this.creep.pos.findClosestByPath(
            FIND_DROPPED_RESOURCES,
            {
                filter: (r: Resource) =>
                    r.resourceType == RESOURCE_ENERGY &&
                    r.amount > 0 &&
                    r.pos.getOpenPositions().length,
            }
        );

        const closestRuinEnergy = this.creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });

        const closestTombEnergy = this.creep.pos.findClosestByPath(
            FIND_TOMBSTONES,
            {
                filter: (r: Ruin) =>
                    r.pos.getOpenPositions().length &&
                    r.store[RESOURCE_ENERGY] > 0,
            }
        );
        if (closestDroppedEnergy || closestRuinEnergy || closestTombEnergy) {
            targets[targets.length] =
                closestDroppedEnergy || closestRuinEnergy || closestTombEnergy;
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
    run() {
        let selectedTarget: Structure | null = null;

        if (!this.runBasic()) return;

        const droppedResource = this.creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (res) => res.resourceType !== RESOURCE_ENERGY,
        });
        if (
            droppedResource.length &&
            this.creep.room.storage &&
            this.creep.store.getFreeCapacity() > 1
        ) {
            const selectedResourse =
                this.creep.pos.findClosestByPath(droppedResource);
            if (this.creep.pickup(selectedResourse) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(selectedResourse, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        }
        let checkOtherResources = Object.entries(this.creep.store).filter(
            ([key, value]) => value > 1 && key !== RESOURCE_ENERGY
        ).length;

        if (this.creep.store.getFreeCapacity() && !checkOtherResources) {
            if (!this.harvestEnergy()) {
                this.harvestFromOtherRooms();
                return;
            }
        } else {
            if (!this.creep.room.controller?.my) {
                this.moveHome();
            }
            const targets: Structure[] = this.creep.store[RESOURCE_ENERGY]
                ? this.creep.room.find(FIND_STRUCTURES, {
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
            const storages: Structure[] = this.creep.room.find(
                FIND_STRUCTURES,
                {
                    filter: (structure) => {
                        return (
                            (structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType === STRUCTURE_LINK ||
                                structure.structureType ===
                                    STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity() > 0
                        );
                    },
                }
            );
            if (checkOtherResources && this.creep.room.storage) {
                selectedTarget = this.creep.room.storage;
            } else {
                selectedTarget = storages.length
                    ? this.creep.pos.findClosestByPath(storages)
                    : this.creep.pos.findClosestByPath(targets);
            }

            if (selectedTarget) {
                if (this.creep.pos.isNearTo(selectedTarget)) {
                    if (selectedTarget.structureType === STRUCTURE_STORAGE) {
                        this.creep.transfer(
                            selectedTarget,
                            //@ts-ignore
                            _.findKey(this.creep.store),
                            //@ts-ignore
                            this.creep.store[_.findKey(this.creep.store)]
                        );
                    } else {
                        this.creep.transfer(selectedTarget, RESOURCE_ENERGY);
                    }
                } else {
                    this.creep.moveTo(selectedTarget, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                }
            }

            if (!selectedTarget && this.creep.store.getFreeCapacity() === 0) {
                if (!this.repairStructures()) {
                    this.sleep();
                }
            }
        }
    }
}

export { HarvesterController };
