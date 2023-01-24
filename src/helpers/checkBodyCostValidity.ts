import { ICreep } from "../types/Creep";

export const checkBodyCostValidity = (creep: ICreep) => {
    const cost = creep.body.reduce(function (cost, part) {
        return cost + BODYPART_COST[part.type];
    }, 0);
    if (cost > creep.room.energyCapacityAvailable * 0.8) {
        return true;
    } else {
        return false;
    }
};
