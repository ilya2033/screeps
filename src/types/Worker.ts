import { ICreep, ICreepMemory } from "./Creep";

export interface IWorker extends ICreep {
    memory: IWorkerMemory;
    findEnergySource: () => void;
}
export interface IWorkerMemory extends ICreepMemory {
    working?: boolean;
    sourceId?: string;
}
