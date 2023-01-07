import RoleHarvester from "./roles/RoleHarvester";
import RoleWarrior from "./roles/RoleWarrior";
import RoleArcher from "./roles/RoleArcher";
import RoleHealer from "./roles/RoleHealer";
import RoleBuilder from "./roles/RoleBuilder";
import { creepsSpawnScript } from "./scripts/creeps.spawn";
import { runAllFC } from "./functions/runAllFC";
import { IArcher } from "./types/Archer";
import { IWarrior } from "./types/Warrior";
import { IUpgrader } from "./types/Upgrader";
import { IBuilder } from "./types/Builder";
import { IHarvester } from "./types/Harvester";

import RoleUpgrader from "roles/RoleUpgrader";
import RoleTower from "./roles/RoleTower";
import { IHealer } from "./types/Healer";
import conf from "./settings";
import RoleClaimer from "./roles/RoleClaimer";

runAllFC();

export const loop = () => {
    if (!Memory.needCreeps) {
        Memory.needCreeps = { builders: [], upgraders: [], solders: [] };
    }
    if (!Memory.powerBanks) {
        Memory.powerBanks = [];
    }
    creepsSpawnScript();
    if (Memory.powerBanks?.length) {
        Memory.powerBanks = Memory.powerBanks.filter(
            (roomId) =>
                Game.rooms[roomId].find(FIND_STRUCTURES, {
                    filter: (st: Structure) =>
                        st.structureType === STRUCTURE_POWER_BANK,
                }).length
        );
    }

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const hostiles = room.find(FIND_HOSTILE_CREEPS);

        room.memory.damagedStructures =
            room.memory.damagedStructures?.filter(
                (st) => typeof st === "string"
            ) || [];

        const damagedStructures = room
            .find(FIND_STRUCTURES, {
                filter: (struct) => {
                    if (!struct) {
                        return false;
                    }
                    if (
                        struct.hits <= struct.hitsMax * 0.7 &&
                        struct.structureType !== STRUCTURE_WALL &&
                        struct.hitsMax > 1
                    ) {
                        return true;
                    }
                    if (
                        struct.structureType === STRUCTURE_WALL &&
                        struct.hits <= conf.structs.wall.MIN_HP
                    ) {
                        return true;
                    }
                    return false;
                },
            })
            .map((struct: Structure) => struct.id);

        let damagedStructuresToAdd = [];

        if (damagedStructures !== room.memory.damagedStructures) {
            damagedStructuresToAdd = (damagedStructures || []).filter(
                (ds1: Id<Structure>) =>
                    (room.memory.damagedStructures || []).find(
                        (ds2: Id<Structure>) => ds1 === ds2
                    ) === undefined
            );
        }

        if (damagedStructuresToAdd.length) {
            room.memory.damagedStructures = [
                ...(room.memory.damagedStructures || []),
                ...damagedStructuresToAdd,
            ];
        }

        if (room.memory.damagedStructures.length) {
            room.memory.damagedStructures = (
                room.memory.damagedStructures || []
            ).filter((struct_id) => {
                const struct = Game.getObjectById(struct_id);
                if (!struct) {
                    return false;
                }
                return struct.structureType !== STRUCTURE_WALL
                    ? struct.hits < struct.hitsMax * 0.9
                    : struct.hits <= conf.structs.wall.MAX_HP;
            });
        }
        const roomsWithPower = Object.values(
            Game.map.describeExits(room.name)
        ).filter(
            (roomId) =>
                Game.rooms[roomId]?.find(FIND_STRUCTURES, {
                    filter: (st: Structure) =>
                        st.structureType === STRUCTURE_POWER_BANK,
                }).length
        );

        if (roomsWithPower.length) {
            roomsWithPower.forEach((room) => {
                Memory.powerBanks = [...Memory.powerBanks, room];
            });
        }

        const harvesters: IHarvester[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "harvester"
        );
        const builders: IBuilder[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "builder"
        );
        const upgraders: IUpgrader[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "upgrader"
        );
        const warriors: IWarrior[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "warrior"
        );

        const archers: IArcher[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "archer"
        );

        const healers: IHealer[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "healer"
        );

        const claimers: IHealer[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "claimer"
        );
        let towers = [];

        if (hostiles.length) {
            towers = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_TOWER },
            });
        }
        if (room.controller?.my) {
            if (!room.find(FIND_MY_SPAWNS).length) {
                if (builders.length < 2) {
                    if (!Memory.needCreeps.builders.includes(room.name)) {
                        Memory.needCreeps.builders = [
                            ...(Memory.needCreeps.builders || []),
                            room.name,
                        ];
                    }
                } else {
                    Memory.needCreeps.builders =
                        Memory.needCreeps.builders.filter(
                            (name) => name !== room.name
                        );
                }

                if (!upgraders.length) {
                    if (!Memory.needCreeps.upgraders.includes(room.name)) {
                        Memory.needCreeps.upgraders = [
                            ...(Memory.needCreeps.upgraders || []),
                            room.name,
                        ];
                    }
                } else {
                    Memory.needCreeps.upgraders =
                        Memory.needCreeps.upgraders.filter(
                            (name) => name !== room.name
                        );
                }
            } else {
                Memory.needCreeps.builders = Memory.needCreeps.builders.filter(
                    (name) => name !== room.name
                );
                Memory.needCreeps.upgraders =
                    Memory.needCreeps.upgraders.filter(
                        (name) => name !== room.name
                    );
            }

            if (
                hostiles.length &&
                warriors.length + healers.length + archers.length < 3
            ) {
                if (!Memory.needCreeps.solders.includes(room.name)) {
                    Memory.needCreeps.solders = Memory.needCreeps.solders = [
                        ...(Memory.needCreeps.solders || []),
                        room.name,
                    ];
                }
            } else {
                Memory.needCreeps.solders = Memory.needCreeps.solders.filter(
                    (name) => name !== room.name
                );
            }
        }
        if (towers.length) {
            towers.forEach((tower) => RoleTower.run(tower));
        }

        harvesters.forEach((creep) => RoleHarvester.run(creep));
        builders.forEach((creep) => RoleBuilder.run(creep));
        upgraders.forEach((creep) => RoleUpgrader.run(creep));
        warriors.forEach((creep) => RoleWarrior.run(creep));
        archers.forEach((creep) => RoleArcher.run(creep));
        healers.forEach((creep) => RoleHealer.run(creep));
        claimers.forEach((creep) => RoleClaimer.run(creep));
    });
};
