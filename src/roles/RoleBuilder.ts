import RoleWorker from "./RoleWorker";
import { IBuilder } from "../types/Builder";

const RoleBuilder = {
    ...RoleWorker,
    ...{
        roleName: "builder",
        run: function (creep: IBuilder) {
            if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.building = false;
                creep.say("🔄 harvest");
            }
            if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
                creep.memory.building = true;
                creep.say("🚧 build");
            }
            let roomsToHelp = [];
            let routeToRoomsToHelp = null;

            if (Memory.needCreeps.builders?.length) {
                roomsToHelp = Memory.needCreeps.builders.filter((name) =>
                    Object.values(
                        Game.map.describeExits(creep.room.name) || []
                    ).includes(name)
                );

                if (roomsToHelp.length) {
                    const route = Game.map.findRoute(
                        creep.room.name,
                        roomsToHelp[0]
                    );
                    routeToRoomsToHelp = creep.pos.findClosestByRange(
                        route[0].exit
                    );
                }
            }
            if (creep.memory.building) {
                let buildTargets = creep.room.find(FIND_CONSTRUCTION_SITES);

                if (routeToRoomsToHelp) {
                    creep.moveTo(routeToRoomsToHelp);
                } else {
                    if (buildTargets.length) {
                        if (creep.build(buildTargets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(buildTargets[0], {
                                visualizePathStyle: { stroke: "#ffffff" },
                            });
                        }
                    } else {
                        this.sleep(creep);
                    }
                }
            } else {
                creep.harvestEnergy();
            }
        },
    },
};

export default RoleBuilder as unknown as IBuilder;
