import { HarvesterController } from "../roles/HarvesterController";
import { WarriorController } from "../roles/WarriorController";
import { ArcherController } from "../roles/ArcherController";
import { HealerController } from "../roles/HealerController";
import { BuilderController } from "../roles/BuilderController";
import { UpgraderController } from "../roles/UpgraderController";
import { TowerController } from "../roles/TowerController";
import { ClaimerController } from "../roles/ClaimerController";
import { TrackController } from "../roles/TrackController";
import { ExcavatorController } from "../roles/ExcavatorController";

import { ICreep } from "../types/Creep";

import { terminalScript } from "./terminal.room";
import { checkNearRoomsScript } from "./checkNearRooms.rooms";
import { roadScript } from "./room.roads";
import { attackTimerScript } from "./attackTimer.room";
import { recycleCreepsScript } from "./recycleCreeps.room";
import { labScript } from "./lab.room";
import conf from "../settings";

const roomScript = function () {
    Object.values(Game.rooms).forEach((room) => {
        if (!room.memory.roads) {
            room.memory.roads = [];
        }
        if (!room.memory.nearRooms) {
            room.memory.nearRooms = [];
        }
        attackTimerScript(room);
        // terminalScript(room);
        roadScript(room);
        checkNearRoomsScript(room);
        recycleCreepsScript(room);
        // labScript(room);
        const creeps: ICreep[] = room.find(FIND_MY_CREEPS);
        const attacked = room.memory.attacked;
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

        const harvesterControllers: HarvesterController[] =
            HarvesterController.createFromCreeps(creeps);
        const builderControllers: BuilderController[] =
            BuilderController.createFromCreeps(creeps);
        const upgraderControllers: UpgraderController[] =
            UpgraderController.createFromCreeps(creeps);
        const warriorControllers: WarriorController[] =
            WarriorController.createFromCreeps(creeps);
        const archerControllers: ArcherController[] =
            ArcherController.createFromCreeps(creeps);
        const healerControllers: HealerController[] =
            HealerController.createFromCreeps(creeps);
        const claimerControllers: ClaimerController[] =
            ClaimerController.createFromCreeps(creeps);
        const trackControllers: TrackController[] =
            TrackController.createFromCreeps(creeps);
        const excavatorControllers: ExcavatorController[] =
            ExcavatorController.createFromCreeps(creeps);

        let towers = [];

        room.memory.controlUpgrader =
            room.controller?.pos.findClosestByPath(
                upgraderControllers.map((controller) => controller.creep)
            )?.name || null;

        if (
            room.terminal &&
            (!room.memory.terminalTrack || !creeps[room.memory.terminalTrack])
        ) {
            room.memory.terminalTrack =
                room.controller?.pos.findClosestByPath(
                    trackControllers.map((controller) => controller.creep)
                )?.name || null;
        }

        if (room.memory.damagedStructures?.length || attacked) {
            towers = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_TOWER },
            });
        }
        if (attacked) {
            const spawn = room.find(FIND_MY_SPAWNS)[0];
            if (
                (spawn && spawn.hits < spawn.hitsMax) ||
                room.controller.ticksToDowngrade < 1000
            ) {
                room.controller.activateSafeMode();
            }
        } else {
        }

        if (
            room.find(FIND_CONSTRUCTION_SITES)?.length &&
            room.controller &&
            (!room.controller?.owner || room.controller?.my)
        ) {
            if (builderControllers.length < 2) {
                if (!Memory.needCreeps.builders.includes(room.name)) {
                    Memory.needCreeps.builders = [
                        ...(Memory.needCreeps.builders || []),
                        room.name,
                    ];
                }
            } else {
                Memory.needCreeps.builders = Memory.needCreeps.builders.filter(
                    (name) => name !== room.name
                );
            }
        } else {
            Memory.needCreeps.builders = Memory.needCreeps.builders.filter(
                (name) => name !== room.name
            );
        }

        if (room.controller?.my) {
            if (!room.find(FIND_MY_SPAWNS).length) {
                if (!upgraderControllers.length) {
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
                Memory.needCreeps.upgraders =
                    Memory.needCreeps.upgraders.filter(
                        (name) => name !== room.name
                    );
            }

            if (
                attacked &&
                warriorControllers.length +
                    healerControllers.length +
                    archerControllers.length <
                    3
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

        TowerController.runAll();
        HarvesterController.runAll();
        BuilderController.runAll();
        UpgraderController.runAll();
        WarriorController.runAll();
        ArcherController.runAll();
        HealerController.runAll();
        ClaimerController.runAll();
        TrackController.runAll();
        ExcavatorController.runAll();
    });
};

export { roomScript };
