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

import RoleRepair from "../roles/RoleRepair";
import settings from "../settings";
import { IArcher } from "../types/Archer";
import { IBuilder } from "../types/Builder";
import { IHarvester } from "../types/Harvester";
import { IHealer } from "../types/Healer";
import { IRepair } from "../types/Repair";
import { IUpgrader } from "../types/Upgrader";
import { IWarrior } from "../types/Warrior";

interface MyCreeps {
    harvesters?: IHarvester[];
    builders?: IBuilder[];
    repairs?: IRepair[];
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
        const energyCapacityAvailable = room.energyCapacityAvailable;
        const sources = Object.values(room.find(FIND_SOURCES));
        const sourcesWalkablePlaces = sources.reduce(
            (prev, s: Source) => prev + s.pos.getWalkablePositions().length,
            0
        );
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        const safeMode = room.controller?.safeMode;
        const damagedSructures = room.find(FIND_STRUCTURES, {
            filter: (structure) =>
                structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL,
        });

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

        myCreeps.repairs = Object.values(creeps).filter(
            (creep) => creep.memory.role === "repair"
        );

        myCreeps.healers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "healer"
        );

        const isHostiles = hostiles.length;
        const creepsPerSource = Math.ceil(sourcesWalkablePlaces / 2);

        const harvestersCondition =
            !isHostiles &&
            (myCreeps.harvesters.length < settings.creeps.MIN_HARVESTERS ||
                (myCreeps.harvesters.length <= creepsPerSource &&
                    myCreeps.harvesters.length <
                        settings.creeps.MAX_HARVESTERS));

        const upgradersCondition =
            !isHostiles &&
            (myCreeps.upgraders.length < settings.creeps.MIN_UPGRADERS ||
                (myCreeps.upgraders.length <= creepsPerSource &&
                    myCreeps.upgraders.length < settings.creeps.MAX_UPGRADERS));

        const warriorsCondition =
            (isHostiles &&
                myCreeps.warriors.length < settings.creeps.MAX_WARRIORS) ||
            (!isHostiles && myCreeps.warriors.length < 1);

        const archerCondition =
            (isHostiles &&
                myCreeps.archers.length < settings.creeps.MAX_ARCHERS) ||
            (!isHostiles && myCreeps.archers.length < 1);

        const healersCondition =
            (isHostiles &&
                myCreeps.healers.length < settings.creeps.MAX_HEALERS) ||
            (!isHostiles && myCreeps.healers.length < 1);

        const buildersCondition =
            !isHostiles &&
            (myCreeps.builders.length < settings.creeps.MIN_BUILDERS ||
                (myCreeps.builders.length <= creepsPerSource &&
                    myCreeps.builders.length < settings.creeps.MAX_BUILDERS));

        const repairsCondition =
            !isHostiles &&
            myCreeps.repairs.length < damagedSructures.length / 3 &&
            settings.global.IS_FIXING &&
            myCreeps.repairs.length < settings.creeps.MAX_REPAIRS;

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
                        console.log("upgrader");
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

            case repairsCondition:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleRepair.spawn(spawn);
                        break;
                    }
                }
                break;
        }
    });
};

export { creepsSpawnScript };
