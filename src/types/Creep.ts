export interface ICreep extends Creep {
    memory: ICreepMemory;
}
export interface ICreepMemory extends CreepMemory {
    role: string;
    recover: boolean;
    oldPosition: { x: number; y: number };
    spawnRoom: string;
}
