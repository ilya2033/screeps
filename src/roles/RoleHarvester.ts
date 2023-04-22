import RoleWorker from "./RoleWorker";
import { IHarvester } from "../types/Harvester";
import { roomPositionFC } from "../functions/roomPositionFC";

const RoleHarvester = {
    ...RoleWorker,
    ...{
        roleName: "harvester",
        harvestEnergy: function (creep: IHarvester) {
            let targets = [];
            let storedSource = null;

            storedSource = <Source | null>(
                Game.getObjectById(<Id<_HasId>>creep.memory.sourceId || null)
            );

            if (
                !storedSource ||
                (!storedSource.pos.getOpenPositions().length &&
                    !creep.pos.isNearTo(storedSource)) ||
                storedSource.room.name !== creep.room.name ||
                storedSource.energy === 0
            ) {
                delete creep.memory.sourceId;
                storedSource = creep.findEnergySource();
            }

            const closestDroppedEnergy = creep.pos.findClosestByPath(
                FIND_DROPPED_RESOURCES,
                {
                    filter: (r: Resource) =>
                        r.resourceType == RESOURCE_ENERGY &&
                        r.amount > 0 &&
                        r.pos.getOpenPositions().length,
                }
            );

            const closestRuinEnergy = creep.pos.findClosestByPath(FIND_RUINS, {
                filter: (r: Ruin) =>
                    r.pos.getOpenPositions().length &&
                    r.store[RESOURCE_ENERGY] > 0,
            });

            const closestTombEnergy = creep.pos.findClosestByPath(
                FIND_TOMBSTONES,
                {
                    filter: (r: Ruin) =>
                        r.pos.getOpenPositions().length &&
                        r.store[RESOURCE_ENERGY] > 0,
                }
            );
            if (
                closestDroppedEnergy ||
                closestRuinEnergy ||
                closestTombEnergy
            ) {
                targets[targets.length] =
                    closestDroppedEnergy ||
                    closestRuinEnergy ||
                    closestTombEnergy;
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
        run: function (creep: IHarvester) {
            let selectedTarget: Structure | null = null;

            if (!this.runBasic(creep)) return;

            const droppedResource = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (res) => res.resourceType !== RESOURCE_ENERGY,
            });
            if (
                droppedResource.length &&
                creep.room.storage &&
                creep.store.getFreeCapacity() > 1
            ) {
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
                if (!creep.harvestEnergy()) {
                    this.harvestFromOtherRooms(creep);
                    return;
                }
            } else {
                if (!creep.room.controller?.my) {
                    this.moveHome(creep);
                }
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
                            creep.transfer(
                                selectedTarget,
                                //@ts-ignore
                                _.findKey(creep.store),
                                //@ts-ignore
                                creep.store[_.findKey(creep.store)]
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
