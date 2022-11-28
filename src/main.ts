import RoleHarvester from "./roles/RoleHarvester";
import roleWarrior from "./roles/role.warrior";
import roleArcher from "./roles/role.archer";
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
import roleHealer from "./roles/role.healer";
import RoleUpgrader from "roles/RoleUpgrader";

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

    harvesters.forEach((creep) => RoleHarvester.run(creep));
    builders.forEach((creep) => RoleBuilderr.run(creep));
    upgraders.forEach((creep) => RoleUpgrader.run(creep));
    repairs.forEach((creep) => RoleRepair.run(creep));

    warriors.forEach((creep) => roleWarrior.run(creep));
    archers.forEach((creep) => roleArcher.run(creep));
    healers.forEach((creep) => roleHealer.run(creep));
};
