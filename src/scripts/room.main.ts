import RoleHarvester from "../roles/RoleHarvester";
import RoleWarrior from "../roles/RoleWarrior";
import RoleArcher from "../roles/RoleArcher";
import RoleHealer from "../roles/RoleHealer";
import RoleBuilder from "../roles/RoleBuilder";

import { IArcher } from "../types/Archer";
import { IWarrior } from "../types/Warrior";
import { IUpgrader } from "../types/Upgrader";
import { IBuilder } from "../types/Builder";
import { IHarvester } from "../types/Harvester";

import RoleUpgrader from "../roles/RoleUpgrader";
import RoleTower from "../roles/RoleTower";
import { IHealer } from "../types/Healer";
import conf from "../settings";
import RoleClaimer from "../roles/RoleClaimer";
import RoleTrack from "../roles/RoleTrack";
import { IScout } from "../types/Scout";
import RoleScout from "../roles/RoleScout";

const roomScript = function () {
    const scoutes: IScout[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "scout"
    );

    scoutes.forEach((creep) => RoleScout.run(creep));

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const toHeal = room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax,
        });
        let links: StructureLink[] = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_LINK },
        });

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
        ).filter((roomId) => {
            return Game.rooms[roomId]?.find(FIND_STRUCTURES, {
                filter: (st) => st.structureType === STRUCTURE_POWER_BANK,
            }).length;
        });

        if (roomsWithPower.length) {
            roomsWithPower.forEach((room) => {
                Memory.powerBanks = [
                    ...new Set([...(Memory.powerBanks || []), room]),
                ];
            });
        }

        if (links.length > 1) {
            links.sort(
                (a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]
            );
            if (
                links[0].store[RESOURCE_ENERGY] >= 100 &&
                links[0].store[RESOURCE_ENERGY] >=
                    links[links.length - 1].store[RESOURCE_ENERGY] * 1.2
            ) {
                links[0].transferEnergy(
                    links[links.length - 1],
                    Math.floor(
                        links[0].store[RESOURCE_ENERGY] -
                            links[links.length - 1].store[RESOURCE_ENERGY]
                    ) / 2
                );
            }
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

        const tracks: IHealer[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "track"
        );

        const solders = [...warriors, ...archers, ...healers];
        const workers = [...tracks, ...upgraders, ...builders, ...harvesters];
        let towers = [];

        room.memory.controlUpgrader =
            room.controller?.pos.findClosestByPath(upgraders)?.name || null;

        if (room.memory.damagedStructures?.length || hostiles.length) {
            towers = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_TOWER },
            });
        }

        room.find(FIND_MY_SPAWNS).forEach((spawn) => {
            if (
                !roomsWithPower.length &&
                !hostiles.length &&
                solders.length &&
                !Memory.needCreeps?.solders?.length
            ) {
                solders.forEach((solder) => {
                    if (
                        solder.ticksToLive < 1300 &&
                        solder.memory.role === "healer"
                            ? !toHeal.length
                            : !roomsWithPower.length
                    ) {
                        if (spawn.pos.isNearTo(solder)) {
                            spawn.recycleCreep(solder);
                        }
                    }
                });
            }

            workers.forEach((worker) => {
                if (
                    worker.memory.role === "builder" &&
                    !room.find(FIND_CONSTRUCTION_SITES).length
                ) {
                    spawn.recycleCreep(worker);
                } else {
                    const workerTypeCreeps = Object.values(creeps).filter(
                        (creep) => creep.memory.role === worker.memory.role
                    );
                    const cost = worker.body.reduce(function (cost, part) {
                        return cost + BODYPART_COST[part.type];
                    }, 0);
                    if (
                        cost < room.energyCapacityAvailable * 0.8 &&
                        workerTypeCreeps.length <=
                            (conf.creeps[
                                `MAX_${worker.memory.role?.toUpperCase()}S`
                            ] || Infinity)
                    ) {
                        if (spawn.pos.isNearTo(worker)) {
                            spawn.renewCreep(worker);
                        }
                    } else {
                        worker.ticksToLive < 200 && spawn.recycleCreep(worker);
                    }
                }
            });
        });

        if (hostiles.length) {
            const spawn = room.find(FIND_MY_SPAWNS)[0];
            if (
                (spawn && spawn.hits < spawn.hitsMax) ||
                room.controller.ticksToDowngrade < 1000
            ) {
                room.controller.activateSafeMode();
            }
        } else {
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
        tracks.forEach((creep) => RoleTrack.run(creep));
    });
};

export { roomScript };
