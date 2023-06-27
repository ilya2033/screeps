import { IWorker, IWorkerMemory } from "./Worker";

export interface IBuilderMemory extends IWorkerMemory {}

export interface IBuilder extends IWorker {
    memory: IBuilderMemory;
}
