import { ArcherController } from "../roles/ArcherController";
import { HarvesterController } from "../roles/HarvesterController";
import { HealerController } from "../roles/HealerController";
import { UpgraderController } from "../roles/UpgraderController";
import { WarriorController } from "../roles/WarriorController";
import { ClaimerController } from "../roles/ClaimerController";
import { ScoutController } from "../roles/ScoutController";
import { BuilderController } from "../roles/BuilderController";
import { TrackController } from "../roles/TrackController";
import { ExcavatorController } from "../roles/ExcavatorController";

import settings from "../settings";
import conf from "../settings";

import { ICreep } from "../types/Creep";

interface MyControllers {
    harvesters?: HarvesterController[];
    builders?: BuilderController[];
    upgraders?: UpgraderController[];
    warriors?: WarriorController[];
    archers?: ArcherController[];
    healers?: HealerController[];
    claimers?: ClaimerController[];
    tracks?: TrackController[];
    scouts?: ScoutController[];
    excavators?: ExcavatorController[];
}

const creepsSpawnScript = function () {
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }

    Object.values(Game.rooms).forEach((room) => {
        const creeps: ICreep[] = room.find(FIND_MY_CREEPS);
        const spawns = room.find(FIND_MY_SPAWNS);
        const extractors = room.find(FIND_STRUCTURES, {
            filter: (st) => st.structureType === STRUCTURE_EXTRACTOR,
        });
        const minerals = room.find(FIND_MINERALS);
        const toBuild = room.find(FIND_CONSTRUCTION_SITES);
        const storages = room.find(FIND_STRUCTURES, {
            filter: (structure) =>
                structure.structureType === STRUCTURE_CONTAINER ||
                structure.structureType === STRUCTURE_STORAGE,
        });
        const toHeal = room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax,
        });
        const towers = room.find(FIND_MY_STRUCTURES, {
            filter: (st) =>
                st.structureType === STRUCTURE_TOWER && st.hits === st.hitsMax,
        });
        const sources = Object.values(room.find(FIND_SOURCES));
        const sourcesWalkablePlaces = sources.reduce(
            (prev, s: Source) => prev + s.pos.getWalkablePositions().length,
            0
        );

        const attacked = room.memory.attacked;

        const safeMode = room.controller?.safeMode;

        let myControllers: MyControllers = {};

        myControllers.harvesters = HarvesterController.createFromCreeps(creeps);
        myControllers.builders = BuilderController.createFromCreeps(creeps);
        myControllers.upgraders = UpgraderController.createFromCreeps(creeps);
        myControllers.warriors = WarriorController.createFromCreeps(creeps);
        myControllers.archers = ArcherController.createFromCreeps(creeps);
        myControllers.healers = HealerController.createFromCreeps(creeps);
        myControllers.claimers = ClaimerController.createFromCreeps(creeps);
        myControllers.tracks = TrackController.createFromCreeps(creeps);
        myControllers.scouts = ScoutController.createFromCreeps(creeps);
        myControllers.excavators = ExcavatorController.createFromCreeps(creeps);

        const creepsPerSource = Math.ceil(sourcesWalkablePlaces * 0.5);

        let claimersCondition =
            !!Game.flags[`${room.name}-attackPoint`] &&
            myControllers.claimers.length < 2;

        let harvestersCondition =
            myControllers.harvesters.length < conf.creeps.MIN_HARVESTERS ||
            myControllers.harvesters.length < creepsPerSource;

        let upgradersCondition =
            myControllers.upgraders.length < settings.creeps.MIN_UPGRADERS ||
            (myControllers.upgraders.length <= creepsPerSource &&
                myControllers.upgraders.length <
                    (room.memory.damagedStructures?.length && !towers.length
                        ? settings.creeps.MAX_UPGRADERS
                        : 1));

        let excavatorsCondition =
            !attacked &&
            myControllers.excavators.length < extractors.length &&
            minerals.some(
                (mineral) =>
                    mineral.mineralAmount > 0 &&
                    room.storage &&
                    room.storage.store.getFreeCapacity() >
                        room.storage.store.getCapacity() * 0.2
            );
        let warriorsCondition =
            attacked &&
            myControllers.warriors.length < settings.creeps.MAX_WARRIORS;

        let archersCondition =
            attacked &&
            myControllers.archers.length < settings.creeps.MAX_ARCHERS;

        let healersCondition =
            (attacked &&
                myControllers.healers.length < settings.creeps.MAX_HEALERS) ||
            toHeal.length;

        let tracksCondition = !!(
            myControllers.tracks.length < creepsPerSource &&
            myControllers.tracks.length < conf.creeps.MAX_TRACKS &&
            storages.length
        );

        let buildersCondition =
            !attacked &&
            toBuild.length &&
            myControllers.builders.length <= creepsPerSource &&
            myControllers.builders.length < settings.creeps.MAX_BUILDERS;

        let scoutsCondition =
            myControllers.scouts.length < settings.creeps.MAX_SCOUTS;

        if (Memory.needCreeps.builders?.length) {
            const roomsToHelp = Memory.needCreeps.builders.filter((name) =>
                Object.values(Game.map.describeExits(room.name) || []).includes(
                    name
                )
            );
            if (roomsToHelp.length) {
                if (!myControllers.builders.length) {
                    buildersCondition = true;
                }
            }
        }

        if (Memory.needCreeps.solders?.length && !attacked) {
            const roomsToHelp = Memory.needCreeps.solders.filter((name) =>
                Object.values(Game.map.describeExits(room.name) || []).includes(
                    name
                )
            );
            if (roomsToHelp.length) {
                if (
                    myControllers.warriors.length +
                        myControllers.healers.length +
                        myControllers.archers.length <
                    3
                ) {
                    warriorsCondition = true;
                    healersCondition = true;
                    archersCondition = true;
                }
            }
        }

        // if (Memory.powerBanks?.length) {
        //     const readyRoles = (Memory.powerHuntingGroup || []).map(
        //         (creep) => Game.creeps[creep].memory.role
        //     );

        //     if (!readyRoles.includes("healer")) {
        //         healersCondition = true;
        //     }

        //     if (!readyRoles.includes("warrior")) {
        //         warriorsCondition = true;
        //     }

        //     if (!readyRoles.includes("harvester")) {
        //         harvestersCondition = true;
        //     }
        // }

        switch (true) {
            case harvestersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        HarvesterController.spawn(spawn);
                        break;
                    }
                }
                break;
            case upgradersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        UpgraderController.spawn(spawn);
                        break;
                    }
                }
                break;
            case tracksCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        TrackController.spawn(spawn);
                        break;
                    }
                }
                break;
            case warriorsCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        WarriorController.spawn(spawn);
                        break;
                    }
                }
                break;
            case archersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        ArcherController.spawn(spawn);
                        break;
                    }
                }
                break;

            case healersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        HealerController.spawn(spawn);
                        break;
                    }
                }
                break;
            case claimersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        ClaimerController.spawn(spawn);
                        break;
                    }
                }
                break;
            case buildersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        BuilderController.spawn(spawn);
                        break;
                    }
                }
                break;

            case excavatorsCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        ExcavatorController.spawn(spawn);
                        break;
                    }
                }
                break;

            // case scoutsCondition:
            //     for (const spawn of Object.values(spawns)) {
            //         if (spawn.isActive() && !spawn.spawning) {
            //             RoleScout.spawn(spawn);
            //             break;
            //         }
            //     }
            //     break;
        }
    });
};

export { creepsSpawnScript };
