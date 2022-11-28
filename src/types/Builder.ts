import { IWorker } from "./Worker";

export interface IBuilderMemory extends CreepMemory {
    sourceId?: string;
    building?: boolean;
}

export interface IBuilder extends IWorker {
    memory: IBuilderMemory;
}
