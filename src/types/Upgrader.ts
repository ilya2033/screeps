export interface IUpgraderMemory extends CreepMemory {
    sourceId?: string;
    upgrading?: boolean;
}

export interface IUpgrader extends Creep {
    memory: IUpgraderMemory;
}
