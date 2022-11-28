/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creeps.spawn');
 * mod.thing == 'a thing'; // true
 */

import RoleUpgrader from "../roles/RoleUpgrader";
import RoleHarvester from "../roles/RoleHarvester";
import roleWarrior from "../roles/role.warrior";
import RoleBuilderr from "../roles/RoleBuilder";
import roleArcher from "../roles/role.archer";
import roleHealer from "../roles/role.healer";
import settings from "../settings";
import RoleRepair from "../roles/RoleRepair";
import { IHarvester } from "../types/Harvester";
import { IBuilder } from "../types/Builder";
import { IRepair } from "../types/Repair";
import { IUpgrader } from "../types/Upgrader";
import { IWarrior } from "../types/Warrior";
import { IArcher } from "../types/Archer";
import { IHealer } from "../types/Healer";

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

        console.log(
            myCreeps.harvesters.length < settings.creeps.MAX_HARVESTERS
        );

        switch (true) {
            case myCreeps.harvesters.length < settings.creeps.MAX_HARVESTERS:
                console.log("test");
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleHarvester.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;
            case myCreeps.upgraders.length < settings.creeps.MAX_UPGRADERS:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleUpgrader.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;
            case myCreeps.warriors.length < settings.creeps.MAX_WARRIORS:
                for (const spawn of Object.values(spawns)) {
                    const safeMode = spawn.room.controller?.safeMode;
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        roleWarrior.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;
            case myCreeps.archers.length < settings.creeps.MAX_ARCHERS:
                for (const spawn of Object.values(spawns)) {
                    const safeMode = spawn.room.controller?.safeMode;
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        roleArcher.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;

            case myCreeps.healers.length < settings.creeps.MAX_HEALERS:
                for (const spawn of Object.values(spawns)) {
                    const safeMode = spawn.room.controller?.safeMode;
                    if (spawn.isActive() && !spawn.spawning && !safeMode) {
                        roleHealer.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;

            case myCreeps.builders.length < settings.creeps.MAX_BUILDERS:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleBuilderr.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;

            case myCreeps.repairs.length < damagedSructures.length / 3 &&
                settings.global.IS_FIXING &&
                myCreeps.repairs.length < settings.creeps.MAX_REPAIRS:
                for (const spawn of Object.values(spawns)) {
                    if (spawn.isActive() && !spawn.spawning) {
                        RoleBuilderr.spawn(spawn, energyCapacityAvailable);
                        break;
                    }
                }
                break;
        }
    });
};

export { creepsSpawnScript };
