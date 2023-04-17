import { ICreep, ICreepMemory } from "./Creep";

export interface ISolder extends ICreep {
    memory: ISolderMemory;
}
export interface ISolderMemory extends ICreepMemory {}
