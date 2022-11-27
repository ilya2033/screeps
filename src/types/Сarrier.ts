export interface ICarrierMemory extends CreepMemory {
    containerId?: string;
}

export interface ICarrier extends Creep {
    memory: ICarrierMemory;
}
