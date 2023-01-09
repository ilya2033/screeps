/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creeps.spawn');
 * mod.thing == 'a thing'; // true
 */
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
import { IWorker } from "../types/Worker";
import { IClaimer } from "../types/Claimer";
import RoleClaimer from "../roles/RoleClaimer";
import { ITrack } from "../types/Track";
import RoleTrack from "../roles/RoleTrack";
import conf from "../settings";

interface MyCreeps {
    harvesters?: IHarvester[];
    builders?: IBuilder[];
    upgraders?: IUpgrader[];
    warriors?: IWarrior[];
    archers?: IArcher[];
    healers?: IHealer[];
    claimers?: IClaimer[];
    tracks?: ITrack[];
}

const creepsSpawnScript = function () {
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const spawns = room.find(FIND_MY_SPAWNS);

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
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const safeMode = room.controller?.safeMode;

        let myCreeps: MyCreeps = {};

        myCreeps.harvesters = Object.values(creeps).filter(
            (creep) => creep.memory.role === "harvester"
        );
        myCreeps.builders = Object.values(creeps).filter(
            (creep) => creep.memory.role === "builder"
        );
        myCreeps.upgraders = Object.values(creeps).filter(
            (creep) => creep.memory.role === "upgrader"
        );
        myCreeps.warriors = Object.values(creeps).filter(
            (creep) => creep.memory.role === "warrior"
        );
        myCreeps.archers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "archer"
        );

        myCreeps.healers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "healer"
        );

        myCreeps.claimers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "claimer"
        );

        myCreeps.tracks = Object.values(creeps).filter(
            (creep) => creep.memory.role === "track"
        );

        const isHostiles = hostiles.length;
        const creepsPerSource = Math.ceil(sourcesWalkablePlaces * 0.3);

        let claimersCondition =
            !!Game.flags[`${room.name}-attackPoint`] &&
            myCreeps.claimers.length < 2;

        let harvestersCondition = myCreeps.harvesters.length < creepsPerSource;

        let upgradersCondition =
            myCreeps.upgraders.length < settings.creeps.MIN_UPGRADERS ||
            (myCreeps.upgraders.length <= creepsPerSource &&
                myCreeps.upgraders.length <
                    (room.memory.damagedStructures?.length && !towers.length
                        ? settings.creeps.MAX_UPGRADERS
                        : 1));

        let warriorsCondition =
            isHostiles &&
            myCreeps.warriors.length < settings.creeps.MAX_WARRIORS;

        let archersCondition =
            isHostiles && myCreeps.archers.length < settings.creeps.MAX_ARCHERS;

        let healersCondition =
            (isHostiles &&
                myCreeps.healers.length < settings.creeps.MAX_HEALERS) ||
            toHeal.length;

        let tracksCondition = !!(
            myCreeps.tracks.length < creepsPerSource &&
            myCreeps.tracks.length < conf.creeps.MAX_TRACKS &&
            storages.length
        );

        let buildersCondition =
            !isHostiles &&
            toBuild.length &&
            myCreeps.builders.length <= creepsPerSource &&
            myCreeps.builders.length < settings.creeps.MAX_BUILDERS;

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

        if (Memory.needCreeps.solders?.length && !isHostiles) {
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

        if (Memory.powerBanks?.length) {
            const roomsWithPower = Memory.powerBanks.filter((name) =>
                Object.values(Game.map.describeExits(room.name) || []).includes(
                    name
                )
            );
            if (roomsWithPower.length) {
                const roomWithPower = roomsWithPower[0];
                if (
                    !(
                        Game.rooms[roomWithPower].find(FIND_MY_CREEPS, {
                            filter: (creep) => creep.memory.role === "healer",
                        }).length < 2
                    )
                ) {
                    healersCondition = true;
                } else {
                    if (
                        !Game.rooms[roomWithPower].find(FIND_MY_CREEPS, {
                            filter: (creep) => creep.memory.role === "warrior",
                        }).length
                    ) {
                        warriorsCondition = true;
                    }
                }
            }
        }

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
        }
    });
};

export { creepsSpawnScript };
