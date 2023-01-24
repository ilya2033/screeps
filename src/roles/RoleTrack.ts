import RoleWorker from "./RoleWorker";
import { ITrack } from "../types/Track";

const RoleTrack = {
    ...RoleWorker,
    ...{
        roleName: "track",
        basicParts: [CARRY, CARRY, MOVE],
        runTerminal: function (creep: ITrack) {
            if (!creep.room.terminal) {
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
            if (!(selectedResource.resource > 25000)) {
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
        run: function (creep: ITrack) {
            if (!this.runBasic(creep)) return;
            if (creep.name === creep.room.memory.terminalTrack) {
                if (this.runTerminal(creep)) {
                    return;
                }
            }

            if (creep.store.energy === 0) {
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
