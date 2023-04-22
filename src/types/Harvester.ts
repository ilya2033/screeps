import { IWorker, IWorkerMemory } from "./Worker";

export interface IHarvesterMemory extends IWorkerMemory {}

export interface IHarvester extends IWorker {
    memory: IHarvesterMemory;
}
