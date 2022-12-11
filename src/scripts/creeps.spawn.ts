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

interface MyCreeps {
    harvesters?: IHarvester[];
    builders?: IBuilder[];
    upgraders?: IUpgrader[];
    warriors?: IWarrior[];
    archers?: IArcher[];
    healers?: IHealer[];
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

        const isHostiles = hostiles.length;
        const creepsPerSource = Math.ceil(sourcesWalkablePlaces / 2);

        const harvestersCondition =
            myCreeps.harvesters.length < settings.creeps.MIN_HARVESTERS ||
            (myCreeps.harvesters.length <= creepsPerSource &&
                myCreeps.harvesters.length < settings.creeps.MAX_HARVESTERS);

        const upgradersCondition =
            myCreeps.upgraders.length < settings.creeps.MIN_UPGRADERS ||
            (myCreeps.upgraders.length <= creepsPerSource &&
                myCreeps.upgraders.length < settings.creeps.MAX_UPGRADERS);

        const warriorsCondition =
            isHostiles &&
            myCreeps.warriors.length < settings.creeps.MAX_WARRIORS;

        const archerCondition =
            isHostiles && myCreeps.archers.length < settings.creeps.MAX_ARCHERS;

        const healersCondition =
            (isHostiles &&
                myCreeps.healers.length < settings.creeps.MAX_HEALERS) ||
            toHeal.length;

        const buildersCondition =
            !isHostiles &&
            toBuild.length &&
            myCreeps.builders.length <= creepsPerSource &&
            myCreeps.builders.length < settings.creeps.MAX_BUILDERS;

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
            case archerCondition:
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
