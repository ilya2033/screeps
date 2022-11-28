import { ISolder } from "./Solder";

export interface IWarriorMemory extends CreepMemory {}

export interface IWarrior extends ISolder {
    memory: IWarriorMemory;
}
