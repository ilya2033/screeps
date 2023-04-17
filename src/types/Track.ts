import { IWorker, IWorkerMemory } from "./Worker";

export interface ITrackMemory extends IWorkerMemory {}

export interface ITrack extends IWorker {
    memory: ITrackMemory;
}
