import { ISolder, ISolderMemory } from "./Solder";

export interface IArcherMemory extends ISolderMemory {}

export interface IArcher extends ISolder {
    memory: IArcherMemory;
}
