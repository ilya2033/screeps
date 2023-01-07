import { IWorker } from "./Worker";

export interface ITrackMemory extends CreepMemory {}

export interface ITrack extends IWorker {
    memory: ITrackMemory;
}
