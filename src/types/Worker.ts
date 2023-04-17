import { ICreep, ICreepMemory } from "./Creep";

export interface IWorker extends ICreep {
    memory: IWorkerMemory;
}
export interface IWorkerMemory extends ICreepMemory {
    working?: boolean;
}
