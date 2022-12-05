import RoleHarvester from "./roles/RoleHarvester";
import RoleWarrior from "./roles/RoleWarrior";
import RoleArcher from "./roles/RoleArcher";
import RoleHealer from "./roles/RoleHealer";
import RoleBuilderr from "./roles/RoleBuilder";
import { creepsSpawnScript } from "./scripts/creeps.spawn";
import { runAllFC } from "./functions/runAllFC";
import { IArcher } from "./types/Archer";
import { IWarrior } from "./types/Warrior";
import { IUpgrader } from "./types/Upgrader";
import { IBuilder } from "./types/Builder";
import { IHarvester } from "./types/Harvester";
import { IRepair } from "./types/Repair";
import RoleRepair from "./roles/RoleRepair";

import RoleUpgrader from "roles/RoleUpgrader";
import RoleTower from "./roles/RoleTower";

runAllFC();

export const loop = () => {
    creepsSpawnScript();

    Object.values(Game.rooms).forEach((room) => {
        const creeps = room.find(FIND_MY_CREEPS);
        const hostiles = room.find(FIND_HOSTILE_CREEPS);

        const harvesters: IHarvester[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "harvester"
        );
        const builders: IBuilder[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "builder"
        );
        const upgraders: IUpgrader[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "upgrader"
        );
        const warriors: IWarrior[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "warrior"
        );

        const archers: IArcher[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "archer"
        );
        const repairs: IRepair[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "repair"
        );

        const healers: IRepair[] = Object.values(creeps).filter(
            (creep) => creep.memory.role === "healer"
        );

        let towers = [];

        if (hostiles.length) {
            towers = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_TOWER },
            });
        }

        if (towers.length) {
            towers.forEach((tower) => RoleTower.run(tower));
        }

        harvesters.forEach((creep) => RoleHarvester.run(creep));
        builders.forEach((creep) => RoleBuilderr.run(creep));
        upgraders.forEach((creep) => RoleUpgrader.run(creep));
        repairs.forEach((creep) => RoleRepair.run(creep));

        warriors.forEach((creep) => RoleWarrior.run(creep));
        archers.forEach((creep) => RoleArcher.run(creep));
        healers.forEach((creep) => RoleHealer.run(creep));
    });
};
