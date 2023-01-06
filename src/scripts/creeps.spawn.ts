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

interface MyCreeps {
    harvesters?: IHarvester[];
    builders?: IBuilder[];
    upgraders?: IUpgrader[];
    warriors?: IWarrior[];
    archers?: IArcher[];
    healers?: IHealer[];
    claimers?: IClaimer[];
}

const creepsSpawnScript = function () {
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }
    if (!Memory.needCreeps) {
        Memory.needCreeps = { builders: [], upgraders: [], solders: [] };
    }

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const spawns = room.find(FIND_MY_SPAWNS);

        const toBuild = room.find(FIND_CONSTRUCTION_SITES);
        const toRepair = room.find(FIND_STRUCTURES, {
            filter: (struct) => struct.hits < struct.hitsMax,
        });
        const toHeal = room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax,
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

        const isHostiles = hostiles.length;
        const creepsPerSource = Math.ceil(sourcesWalkablePlaces * 0.75);

        const claimersCondition =
            !!Game.flags[`${room.name}-attackPoint`] &&
            myCreeps.claimers.length < 2;

        const harvestersCondition =
            myCreeps.harvesters.length < settings.creeps.MIN_HARVESTERS ||
            (myCreeps.harvesters.length <= creepsPerSource &&
                myCreeps.harvesters.length < settings.creeps.MAX_HARVESTERS);

        const upgradersCondition =
            myCreeps.upgraders.length < settings.creeps.MIN_UPGRADERS ||
            (myCreeps.upgraders.length <= creepsPerSource &&
                myCreeps.upgraders.length < settings.creeps.MAX_UPGRADERS);

        let warriorsCondition =
            isHostiles &&
            myCreeps.warriors.length < settings.creeps.MAX_WARRIORS;

        let archersCondition =
            isHostiles && myCreeps.archers.length < settings.creeps.MAX_ARCHERS;

        let healersCondition =
            (isHostiles &&
                myCreeps.healers.length < settings.creeps.MAX_HEALERS) ||
            toHeal.length;

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
