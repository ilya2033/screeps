import { IWorker, IWorkerMemory } from "./Worker";

export interface IUpgraderMemory extends IWorkerMemory {
    working?: boolean;
}

export interface IUpgrader extends IWorker {
    memory: IUpgraderMemory;
}
