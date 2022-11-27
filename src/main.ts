import roleUpgrader from "./roles/role.upgrader";
import roleHarvester from "./roles/role.harvester";
import roleWarrior from "./roles/role.warrior";
import roleArcher from "./roles/role.archer";
import roleBuilder from "./roles/role.builder";
import { creepsSpawnScript } from "./scripts/creeps.spawn";
import { runAllFC } from "./functions/runAllFC";
import { IArcher } from "./types/Archer";
import { IWarrior } from "./types/Warrior";
import { IUpgrader } from "./types/Upgrader";
import { IBuilder } from "./types/Builder";
import { IHarvester } from "./types/Harvester";
import { IRepair } from "./types/Repair";
import roleRepair from "./roles/role.repair";
import roleHealer from "./roles/role.healer";

runAllFC();

export const loop = () => {
    creepsSpawnScript();

    const hostiles = Object.values(Game.creeps).filter((creep) => !creep.my);

    const harvesters: IHarvester[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "harvester"
    );
    const builders: IBuilder[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "builder"
    );
    const upgraders: IUpgrader[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "upgrader"
    );
    const warriors: IWarrior[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "warrior"
    );

    const archers: IArcher[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "archer"
    );
    const repairs: IRepair[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "repair"
    );

    const healers: IRepair[] = Object.values(Game.creeps).filter(
        (creep) => creep.memory.role === "healer"
    );

    harvesters.forEach((creep) => roleHarvester.run(creep));
    builders.forEach((creep) => roleBuilder.run(creep));
    upgraders.forEach((creep) => roleUpgrader.run(creep));
    repairs.forEach((creep) => roleRepair.run(creep));

    if (hostiles.length) {
        warriors.forEach((creep) => roleWarrior.run(creep));
        archers.forEach((creep) => roleArcher.run(creep));
        healers.forEach((creep) => roleHealer.run(creep));
    }
};
