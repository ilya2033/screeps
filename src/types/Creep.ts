export interface ICreep extends Creep {
    memory: ICreepMemory;
}
export interface ICreepMemory extends CreepMemory {
    oldPosition?: { x: number; y: number };
}
