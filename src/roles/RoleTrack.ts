import RoleWorker from "./RoleWorker";
import { ITrack } from "../types/Track";

const RoleTrack = {
    ...RoleWorker,
    ...{
        roleName: "track",
        basicParts: [CARRY, CARRY, MOVE],
        run: function (creep: ITrack) {
            if (!this.runBasic(creep)) return;

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
