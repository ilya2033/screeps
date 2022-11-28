/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creeps.spawn');
 * mod.thing == 'a thing'; // true
 */

import roleUpgrader from "../roles/role.upgrader";
import roleHarvester from "../roles/role.harvester";
import roleWarrior from "../roles/role.warrior";
import roleBuilder from "../roles/role.builder";
import roleArcher from "../roles/role.archer";
import roleRepair from "../roles/role.repair";
import roleHealer from "../roles/role.healer";
import settings from "../settings";

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
        const damagedSructures = room.find(FIND_STRUCTURES, {
            filter: (structure) =>
                structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL,
        });

        const harvesters = Object.values(creeps).filter(
            (creep) => creep.memory.role === "harvester"
        );
        const builders = Object.values(creeps).filter(
            (creep) => creep.memory.role === "builder"
        );
        const upgraders = Object.values(creeps).filter(
            (creep) => creep.memory.role === "upgrader"
        );
        const warriors = Object.values(creeps).filter(
            (creep) => creep.memory.role === "warrior"
        );
        const archers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "archer"
        );

        const repairs = Object.values(creeps).filter(
            (creep) => creep.memory.role === "repair"
        );

        const healers = Object.values(creeps).filter(
            (creep) => creep.memory.role === "healer"
        );

        if (harvesters.length < settings.creeps.MAX_HARVESTERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleHarvester.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (harvesters.length < settings.creeps.MIN_HARVESTERS) return;

        if (upgraders.length < settings.creeps.MAX_UPGRADERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleUpgrader.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (upgraders.length < settings.creeps.MIN_UPGRADERS) return;

        if (warriors.length < settings.creeps.MAX_WARRIORS) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = spawn.room.controller?.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleWarrior.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (archers.length < settings.creeps.MAX_ARCHERS) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = spawn.room.controller?.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleArcher.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (healers.length < settings.creeps.MAX_HEALERS) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = spawn.room.controller?.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleHealer.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (builders.length < settings.creeps.MAX_BUILDERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleBuilder.spawn(spawn, energyCapacityAvailable);
                }
            }
        }

        if (builders.length < settings.creeps.MIN_BUILDERS) return;
        if (
            repairs.length < damagedSructures.length / 7 &&
            settings.global.IS_FIXING &&
            repairs.length < settings.creeps.MAX_REPAIRS
        ) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleRepair.spawn(spawn, energyCapacityAvailable);
                }
            }
        }
    });
};

export { creepsSpawnScript };
