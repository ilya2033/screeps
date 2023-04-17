import { IWorker, IWorkerMemory } from "./Worker";

export interface IHarvesterMemory extends IWorkerMemory {
    sourceId?: string;
}

export interface IHarvester extends IWorker {
    memory: IHarvesterMemory;
}
