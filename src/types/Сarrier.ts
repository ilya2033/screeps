import { IWorker, IWorkerMemory } from "./Worker";

export interface ICarrierMemory extends IWorkerMemory {
    containerId?: string;
}

export interface ICarrier extends IWorker {
    memory: ICarrierMemory;
}
