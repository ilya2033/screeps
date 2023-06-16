import { ICreep, ICreepMemory } from "./Creep";

export interface IWorker extends ICreep {
    memory: IWorkerMemory;
    findEnergySource: () => void;
    harvestEnergy: () => boolean;
    harvestMinerals: () => void;
    findMineralSource: () => Mineral | null;
    harvestFromOtherRooms: () => void;
    findStorages: () => [StructureStorage | StructureContainer] | null;
    repairStructures: () => boolean;
}
export interface IWorkerMemory extends ICreepMemory {
    working?: boolean;
    sourceId?: string;
    mineralId?: Id<_HasId>;
}
