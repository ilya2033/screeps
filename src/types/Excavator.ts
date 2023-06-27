import { IWorker, IWorkerMemory } from "./Worker";

export interface IExcavatorMemory extends IWorkerMemory {}

export interface IExcavator extends IWorker {
    memory: IExcavatorMemory;
}
