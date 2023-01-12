import { ICreepMemory } from "./Creep";
import { ISolder } from "./Solder";

export interface IWarriorMemory extends ICreepMemory {}

export interface IWarrior extends ISolder {
    memory: IWarriorMemory;
}
