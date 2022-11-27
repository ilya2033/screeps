export interface IBuilderMemory extends CreepMemory {
    sourceId?: string;
    building?: boolean;
}

export interface IBuilder extends Creep {
    memory: IBuilderMemory;
}
