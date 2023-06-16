export interface ICreep extends Creep {
    memory: ICreepMemory;
    run: (creep: Creep, ...args: any) => void;
    findPowerBank: () => StructurePowerBank | null;
    moveToSpawnPoint: (room?: Room) => void;
    moveToDefendPoint: (room?: Room) => void;
    help: () => boolean;
}
export interface ICreepMemory extends CreepMemory {
    role: string;
    recover: boolean;
    oldPosition: { x: number; y: number };
    spawnRoom: string;
    recycle: boolean;
    boost: boolean;
    powerBankId: string;
}
