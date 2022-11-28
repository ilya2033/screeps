import { IWorker } from "./Worker";

export interface IRepairMemory extends CreepMemory {
    sourceId?: string;
    repairing?: boolean;
}

export interface IRepair extends IWorker {
    memory: IRepairMemory;
}
