import { IWorker } from "./Worker";

export interface IHarvesterMemory extends CreepMemory {
    sourceId?: string;
}

export interface IHarvester extends IWorker {
    memory: IHarvesterMemory;
}
