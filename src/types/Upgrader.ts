import { IWorker, IWorkerMemory } from "./Worker";

export interface IUpgraderMemory extends IWorkerMemory {}

export interface IUpgrader extends IWorker {
    memory: IUpgraderMemory;
}
