export interface IHarvesterMemory extends CreepMemory {
    sourceId?: string;
}

export interface IHarvester extends Creep {
    memory: IHarvesterMemory;
}
