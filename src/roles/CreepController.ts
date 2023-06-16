import { ICreep } from "../types/Creep";
import { Controller } from "./Controller";

class CreepController extends Controller {
    creep: ICreep;
    static roleName: string;
    static basicParts: BodyPartConstant[];
    static defaultSetupT1?: BodyPartConstant[];
    static defaultSetupT2?: BodyPartConstant[];
    static defaultSetupT3?: BodyPartConstant[];
    static defaultSetupT4?: BodyPartConstant[];

    constructor(creep: ICreep) {
        super();
        this.creep = creep;
    }

    moveToDefendPoint(room: Room) {
        let flag: Flag;

        if (room) {
            flag = Game.flags[`${room.name}-defendPoint`];
        } else {
            flag = Game.flags[`${this.creep.room.name}-defendPoint`];
        }

        this.creep.moveTo(flag);
    }

    moveToSpawnPoint(room: Room) {
        let flag: Flag;

        if (room) {
            flag = Game.flags[`${room.name}-spawnPoint`];
        } else {
            flag = Game.flags[`${this.creep.room.name}-spawnPoint`];
        }

        this.creep.moveTo(flag);
    }

    findPowerBank() {
        const powerBanks: StructurePowerBank[] = this.creep.room.find(
            FIND_STRUCTURES,
            {
                filter: (st: Structure) =>
                    st.structureType === STRUCTURE_POWER_BANK,
            }
        );

        if (powerBanks.length) {
            const powerBank = Object.values(powerBanks).find(
                (s) => s.pos.getOpenPositions().length > 0
            );

            if (powerBank) {
                this.creep.memory.powerBankId = powerBank.id;
                return powerBank;
            }
        }

        return null;
    }

    recordRoom() {
        const room = this.creep.room;

        Memory.rooms[room.name] = {
            ...Memory.rooms[room.name],
            ...{
                owner: !!room.controller?.owner,
                controller: !!room.controller,
                lastChecked: Game.time,
            },
        };
    }

    recordMove() {
        if (!this.creep.room.memory.roads) {
            this.creep.room.memory.roads = [];
        }

        if (
            !this.creep.memory.oldPosition ||
            this.creep.memory.oldPosition.x !== this.creep.pos.x ||
            this.creep.memory.oldPosition.y !== this.creep.pos.y
        ) {
            const roadIndex = this.creep.room.memory.roads?.findIndex(
                (road) =>
                    road.x === this.creep.pos.x && road.y === this.creep.pos.y
            );

            if (roadIndex >= 0) {
                this.creep.room.memory.roads[roadIndex].count++;
            } else {
                this.creep.room.memory.roads.push({
                    x: this.creep.pos.x,
                    y: this.creep.pos.y,
                    count: 1,
                });
            }
        }

        this.creep.memory.oldPosition = {
            x: this.creep.pos.x,
            y: this.creep.pos.y,
        };
    }

    static spawn(spawn: StructureSpawn) {
        let setup = this.defaultSetupT1;

        if (this.basicParts) {
            let energy = spawn.room.energyAvailable;
            const bodyCost = this.basicParts.reduce(function (cost, part) {
                return cost + BODYPART_COST[part];
            }, 0);
            setup = [];

            while (energy >= bodyCost) {
                setup = [...setup, ...this.basicParts];
                energy = energy - bodyCost;
            }

            if (setup.length === 0) {
                setup = null;
            }
        }

        if (
            spawn.room.energyAvailable === spawn.room.energyCapacityAvailable &&
            !setup
        ) {
            switch (true) {
                case spawn.room.energyAvailable >= 1200:
                    setup = this.defaultSetupT4;
                    break;
                case spawn.room.energyAvailable >= 800:
                    setup = this.defaultSetupT3;
                    break;

                case spawn.room.energyAvailable >= 550:
                    setup = this.defaultSetupT2;
                    break;
            }
        }

        if (!setup) {
            return;
        }

        spawn.spawnCreep(
            setup,
            `${this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1)}${
                Game.time
            }`,
            {
                memory: {
                    role: this.roleName,
                    recover: false,
                    spawnRoom: spawn.room.name,
                    recycle: false,
                },
            }
        );
    }

    static createFromCreeps<T extends CreepController>(creeps: ICreep[]) {
        return Object.values(creeps)
            .filter((creep: ICreep) => creep.memory.role === this.roleName)
            .map((creep: ICreep) => new this(creep)) as T[];
    }

    sleep() {
        if (this.creep.help()) {
            return;
        }
        this.creep.memory.recycle = true;
        this.creep.memory.recover = false;
        const spawn = this.creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (!spawn) {
            this.moveHome();
        } else {
            if (!this.creep.pos.isNearTo(spawn)) {
                this.creep.say("😴 sleep");
                this.creep.moveTo(spawn);
            }
        }
    }
    refresh() {
        const spawn = this.creep.pos.findClosestByPath(FIND_MY_SPAWNS);

        this.creep.memory.recycle = false;
        this.creep.memory.recover = true;

        if (spawn) {
            this.creep.moveTo(spawn);
        } else {
            this.moveHome();
        }

        return true;
    }

    moveHome() {
        const myRoom = this.creep.memory.spawnRoom;
        const route = Game.map.findRoute(this.creep.room.name, myRoom);
        const routeToMyRoom = this.creep.pos.findClosestByRange(route[0]?.exit);

        this.creep.moveTo(routeToMyRoom);

        return true;
    }

    help() {
        return false;
    }

    run(...args: any[]) {
        return;
    }
}

export { CreepController };
