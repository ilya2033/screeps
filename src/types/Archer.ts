import { ISolder } from "./Solder";

export interface IArcherMemory extends CreepMemory {}

export interface IArcher extends ISolder {
    memory: IArcherMemory;
}
