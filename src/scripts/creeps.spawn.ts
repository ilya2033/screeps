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
import settings from "../settings";

const creepsSpawnScript = function () {
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_CREEPS);
        const spawns = room.find(FIND_MY_SPAWNS);
        const damagedSructures = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax,
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

        if (harvesters.length < settings.creeps.MAX_HARVESTERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleHarvester.spawn(spawn);
                }
            }
        }

        if (harvesters.length < settings.creeps.MIN_HARVESTERS) return;

        if (upgraders.length < settings.creeps.MIN_UPGRADERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleUpgrader.spawn(spawn);
                }
            }
        }

        if (upgraders.length < settings.creeps.MIN_UPGRADERS) return;

        if (warriors.length < settings.creeps.MAX_WARRIORS) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = spawn.room.controller?.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleWarrior.spawn(spawn);
                }
            }
        }

        if (archers.length < settings.creeps.MAX_ARCHERS) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = spawn.room.controller?.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleArcher.spawn(spawn);
                }
            }
        }

        if (builders.length < settings.creeps.MAX_BUILDERS) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleBuilder.spawn(spawn);
                }
            }
        }
        if (
            repairs.length < damagedSructures.length / 7 &&
            settings.global.IS_FIXING &&
            repairs.length < settings.creeps.MAX_REPAIRS
        ) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleRepair.spawn(spawn);
                }
            }
        }
    });
};

export { creepsSpawnScript };
