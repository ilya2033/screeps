import { ICreep } from "../types/Creep";

const powerHuntingScript = function () {
    const readyRoles = (Memory.powerHuntingGroup || []).map(
        (creep) => (Game.creeps[creep] as ICreep).memory.role
    );

    Memory.powerHuntingGroup = (Memory.powerHuntingGroup || []).filter(
        (creepName) => Game.creeps[creepName]
    );

    if (
        Memory.powerBanks?.length &&
        (Memory.powerHuntingGroup || []).length < 3
    ) {
        if (!readyRoles.includes("healer")) {
            const creep =
                Object.values(Game.creeps).filter(
                    (creep: ICreep) => creep.memory.role === "healer"
                )[0] || null;

            if (creep) {
                Memory.powerHuntingGroup = [
                    ...new Set([
                        ...(Memory.powerHuntingGroup || []),
                        creep.name,
                    ]),
                ];
            }
        }

        if (!readyRoles.includes("harvester")) {
            const creep =
                Object.values(Game.creeps).filter(
                    (creep: ICreep) => creep.memory.role === "harvester"
                )[0] || null;

            if (creep) {
                Memory.powerHuntingGroup = [
                    ...new Set([
                        ...(Memory.powerHuntingGroup || []),
                        creep.name,
                    ]),
                ];
            }
        }
        if (!readyRoles.includes("warrior")) {
            const creep =
                Object.values(Game.creeps).filter(
                    (creep: ICreep) => creep.memory.role === "warrior"
                )[0] || null;

            if (creep) {
                Memory.powerHuntingGroup = [
                    ...new Set([
                        ...(Memory.powerHuntingGroup || []),
                        creep.name,
                    ]),
                ];
            }
        }
    }

    if (!Memory.powerBanks?.length) {
        Memory.powerHuntingGroup = [];
    }
};

export { powerHuntingScript };
