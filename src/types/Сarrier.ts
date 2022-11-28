import { IWorker } from "./Worker";

export interface ICarrierMemory extends CreepMemory {
    containerId?: string;
}

export interface ICarrier extends IWorker {
    memory: ICarrierMemory;
}
