import { checkBodyCostValidity } from "../helpers/checkBodyCostValidity";
import conf from "../settings";
import { ICreep } from "../types/Creep";

const recycleCreepsScript = function (room: Room) {
    room.find(FIND_MY_SPAWNS).forEach((spawn: StructureSpawn) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const creepsToRecycle = creeps.filter(
            (creep: ICreep) => creep.memory.recycle
        );
        const creepsToRecover = creeps.filter(
            (creep: ICreep) => creep.memory.recover
        );

        creepsToRecycle.forEach((creep) => {
            if (spawn.pos.isNearTo(creep)) {
                spawn.recycleCreep(creep);
            }
        });

        creepsToRecover.forEach((creep: ICreep) => {
            if (spawn.pos.isNearTo(creep)) {
                if (
                    !(spawn.store.energy < 300) &&
                    checkBodyCostValidity(creep)
                ) {
                    spawn.renewCreep(creep);
                } else {
                    spawn.recycleCreep(creep);
                }
            }
        });
    });
};
export { recycleCreepsScript };
