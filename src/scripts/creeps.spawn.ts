import RoleArcher from "../roles/RoleArcher";
import RoleHarvester from "../roles/RoleHarvester";
import RoleHealer from "../roles/RoleHealer";
import RoleUpgrader from "../roles/RoleUpgrader";
import RoleWarrior from "../roles/RoleWarrior";

import RoleBuilder from "../roles/RoleBuilder";

import settings from "../settings";
import { IArcher } from "../types/Archer";
import { IBuilder } from "../types/Builder";
import { IHarvester } from "../types/Harvester";
import { IHealer } from "../types/Healer";
import { IUpgrader } from "../types/Upgrader";
import { IWarrior } from "../types/Warrior";
import { IClaimer } from "../types/Claimer";
import RoleClaimer from "../roles/RoleClaimer";
import { ITrack } from "../types/Track";
import RoleTrack from "../roles/RoleTrack";
import conf from "../settings";
import { IScout } from "../types/Scout";
import RoleScout from "../roles/RoleScout";
import { IExcavator } from "../types/Excavator";
import RoleExcavator from "../roles/RoleExcavator";
import { ICreep } from "../types/Creep";

interface MyCreeps {
    harvesters?: IHarvester[];
    builders?: IBuilder[];
    upgraders?: IUpgrader[];
    warriors?: IWarrior[];
    archers?: IArcher[];
    healers?: IHealer[];
    claimers?: IClaimer[];
    tracks?: ITrack[];
    scouts?: IScout[];
    excavators?: IExcavator[];
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

        let myCreeps: MyCreeps = {};

        myCreeps.harvesters = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "harvester"
        );
        myCreeps.builders = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "builder"
        );
        myCreeps.upgraders = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "upgrader"
        );
        myCreeps.warriors = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "warrior"
        );
        myCreeps.archers = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "archer"
        );

        myCreeps.healers = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "healer"
        );

        myCreeps.claimers = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "claimer"
        );

        myCreeps.tracks = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "track"
        );
        myCreeps.tracks = Object.values(creeps).filter(
            (creep) =>
                creep.memory.spawnRoom === room.name &&
                creep.memory.role === "track"
        );
        myCreeps.scouts = <ICreep[]>(
            Object.values(Game.creeps).filter(
                (creep: ICreep) =>
                    creep.memory.spawnRoom === room.name &&
                    creep.memory.role === "scout"
            )
        );
        myCreeps.excavators = <ICreep[]>(
            Object.values(Game.creeps).filter(
                (creep: ICreep) =>
                    creep.memory.spawnRoom === room.name &&
                    creep.memory.role === "excavator"
            )
        );

        const creepsPerSource = Math.ceil(sourcesWalkablePlaces * 0.5);

        let claimersCondition =
            !!Game.flags[`${room.name}-attackPoint`] &&
            myCreeps.claimers.length < 2;

        let harvestersCondition =
            myCreeps.harvesters.length < conf.creeps.MIN_HARVESTERS ||
            myCreeps.harvesters.length < creepsPerSource;

        let upgradersCondition =
            myCreeps.upgraders.length < settings.creeps.MIN_UPGRADERS ||
            (myCreeps.upgraders.length <= creepsPerSource &&
                myCreeps.upgraders.length <
                    (room.memory.damagedStructures?.length && !towers.length
                        ? settings.creeps.MAX_UPGRADERS
                        : 1));

        let excavatorsCondition =
            !attacked &&
            myCreeps.excavators.length < extractors.length &&
            minerals.some((mineral) => mineral.mineralAmount > 0);
        let warriorsCondition =
            attacked && myCreeps.warriors.length < settings.creeps.MAX_WARRIORS;

        let archersCondition =
            attacked && myCreeps.archers.length < settings.creeps.MAX_ARCHERS;

        let healersCondition =
            (attacked &&
                myCreeps.healers.length < settings.creeps.MAX_HEALERS) ||
            toHeal.length;

        let tracksCondition = !!(
            myCreeps.tracks.length < creepsPerSource &&
            myCreeps.tracks.length < conf.creeps.MAX_TRACKS &&
            storages.length
        );

        let buildersCondition =
            !attacked &&
            toBuild.length &&
            myCreeps.builders.length <= creepsPerSource &&
            myCreeps.builders.length < settings.creeps.MAX_BUILDERS;

        let scoutsCondition =
            myCreeps.scouts.length < settings.creeps.MAX_SCOUTS;

        if (Memory.needCreeps.builders?.length) {
            const roomsToHelp = Memory.needCreeps.builders.filter((name) =>
                Object.values(Game.map.describeExits(room.name) || []).includes(
                    name
                )
            );
            if (roomsToHelp.length) {
                if (!myCreeps.builders.length) {
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
                    myCreeps.warriors.length +
                        myCreeps.healers.length +
                        myCreeps.archers.length <
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
                        RoleHarvester.spawn(spawn);
                        break;
                    }
                }
                break;
            case upgradersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleUpgrader.spawn(spawn);
                        break;
                    }
                }
                break;
            case tracksCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleTrack.spawn(spawn);
                        break;
                    }
                }
                break;
            case warriorsCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        RoleWarrior.spawn(spawn);
                        break;
                    }
                }
                break;
            case archersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        RoleArcher.spawn(spawn);
                        break;
                    }
                }
                break;

            case healersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        RoleHealer.spawn(spawn);
                        break;
                    }
                }
                break;
            case claimersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        RoleClaimer.spawn(spawn);
                        break;
                    }
                }
                break;
            case buildersCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleBuilder.spawn(spawn);
                        break;
                    }
                }
                break;

            case excavatorsCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleExcavator.spawn(spawn);
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
