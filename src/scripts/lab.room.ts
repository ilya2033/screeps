import conf from "../settings";
import { ICreep } from "../types/Creep";

const labScript = function (room: Room) {
    const labs = room.find(FIND_STRUCTURES, {
        filter: (st: Structure) => st.structureType === STRUCTURE_LAB,
    });
    if (!labs.length) {
        return;
    }
    const creeps = room.find(FIND_MY_CREEPS);

    const creepsToBoost = creeps.filter((creep: ICreep) => creep.memory.boost);
    const creepsToUnBoost = creeps.filter(
        (creep: ICreep) => creep.memory.recycle
    );

    labs.forEach((lab: StructureLab) => {
        creepsToUnBoost.forEach((creep) => {
            if (lab.pos.isNearTo(creep)) {
                lab.unboostCreep(creep);
            }
        });
        if (lab.store.energy < 20) {
            return;
        }

        if (lab.store[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] >= 30) {
            const parts = Math.min(
                lab.store[RESOURCE_CATALYZED_UTRIUM_ALKALIDE] / 30,
                lab.store.energy / 20
            );
            creepsToBoost.forEach((creep) => {
                if (lab.pos.isNearTo(creep)) {
                    lab.boostCreep(creep, parts);
                }
            });
        }
    });
};

export { labScript };
