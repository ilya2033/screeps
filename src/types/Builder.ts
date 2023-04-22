import { IWorker, IWorkerMemory } from "./Worker";

export interface IBuilderMemory extends IWorkerMemory {
    building?: boolean;
}

export interface IBuilder extends IWorker {
    memory: IBuilderMemory;
}
