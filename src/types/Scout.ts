import { ICreep, ICreepMemory } from "./Creep";

export interface IScoutMemory extends ICreepMemory {}

export interface IScout extends ICreep {
    memory: IScoutMemory;
}
