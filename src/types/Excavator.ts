import { IWorker, IWorkerMemory } from "./Worker";

export interface IExcavatorMemory extends IWorkerMemory {
    mineralId?: string;
}

export interface IExcavator extends IWorker {
    memory: IExcavatorMemory;
}
