import { ICreep, ICreepMemory } from "./Creep";

export interface IWorker extends ICreep {}
export interface IWorkerMemory extends ICreepMemory {
    working?: boolean;
}
