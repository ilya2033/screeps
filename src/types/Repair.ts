export interface IRepairMemory extends CreepMemory {
    sourceId?: string;
    repairing?: boolean;
}

export interface IRepair extends Creep {
    memory: IRepairMemory;
}
