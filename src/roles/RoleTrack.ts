import RoleWorker from "./RoleWorker";
import { ITrack } from "../types/Track";

const RoleTrack = {
    ...RoleWorker,
    ...{
        roleName: "track",
        run: function (creep: ITrack) {
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

export default RoleTrack as unknown as ITrack;
