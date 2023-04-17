import { ICreep } from "../types/Creep";

export const calculateBodyCost = (creep: ICreep) =>
    creep.body.reduce(function (cost, part) {
        return cost + BODYPART_COST[part.type];
    }, 0);
