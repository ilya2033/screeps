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
const creepsSpawnScript = function () {
    for (let creepName in Memory.creeps) {
        if (!Game.creeps[creepName]) {
            delete Memory.creeps[creepName];
        }
    }
    Object.values(Game.rooms).forEach((room) => {
        var _a, _b;
        const creeps = room.find(FIND_CREEPS);
        const spawns = room.find(FIND_MY_SPAWNS);
        const damagedSructures = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax,
        });
        const harvesters = Object.values(creeps).filter((creep) => creep.memory.role === "harvester");
        const builders = Object.values(creeps).filter((creep) => creep.memory.role === "builder");
        const upgraders = Object.values(creeps).filter((creep) => creep.memory.role === "upgrader");
        const warriors = Object.values(creeps).filter((creep) => creep.memory.role === "warrior");
        const archers = Object.values(creeps).filter((creep) => creep.memory.role === "archer");
        const repairs = Object.values(creeps).filter((creep) => creep.memory.role === "repair");
        if (harvesters.length < 5) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleHarvester.spawn(spawn);
                }
            }
        }
        if (harvesters.length < 3)
            return;
        if (upgraders.length < 3) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleUpgrader.spawn(spawn);
                    break;
                }
            }
        }
        if (warriors.length < 2) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = (_a = spawn.room.controller) === null || _a === void 0 ? void 0 : _a.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleWarrior.spawn(spawn);
                }
            }
        }
        if (archers.length < 3) {
            for (const spawn of Object.values(spawns)) {
                const safeMode = (_b = spawn.room.controller) === null || _b === void 0 ? void 0 : _b.safeMode;
                if (spawn.isActive() && !spawn.spawning && !safeMode) {
                    roleArcher.spawn(spawn);
                }
            }
        }
        if (builders.length < 5) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleBuilder.spawn(spawn);
                }
            }
        }
        if (repairs.length < damagedSructures.length / 7) {
            for (const spawn of Object.values(spawns)) {
                if (spawn.isActive() && !spawn.spawning) {
                    roleRepair.spawn(spawn);
                }
            }
        }
    });
};
export { creepsSpawnScript };
