import { IWorker } from "./Worker";

export interface IUpgraderMemory extends CreepMemory {
    sourceId?: string;
    working?: boolean;
}

export interface IUpgrader extends IWorker {
    memory: IUpgraderMemory;
}
