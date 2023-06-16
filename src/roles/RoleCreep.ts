import { ICreepMemory, ICreep } from "../types/Creep";

class RoleCreep extends Creep implements ICreep {
    roleName: string;
    memory: ICreepMemory;
    basicParts: BodyPartConstant[];
    defaultSetupT1?: BodyPartConstant[];
    defaultSetupT2?: BodyPartConstant[];
    defaultSetupT3?: BodyPartConstant[];
    defaultSetupT4?: BodyPartConstant[];

    moveToDefendPoint(room: Room) {
        let flag: Flag;

        if (room) {
            flag = Game.flags[`${room.name}-defendPoint`];
        } else {
            flag = Game.flags[`${this.room.name}-defendPoint`];
        }

        this.moveTo(flag);
    }

    moveToSpawnPoint(room: Room) {
        let flag: Flag;

        if (room) {
            flag = Game.flags[`${room.name}-spawnPoint`];
        } else {
            flag = Game.flags[`${this.room.name}-spawnPoint`];
        }

        this.moveTo(flag);
    }

    findPowerBank() {
        const powerBanks: StructurePowerBank[] = this.room.find(
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
                this.memory.powerBankId = powerBank.id;
                return powerBank;
            }
        }

        return null;
    }

    recordRoom() {
        const room = this.room;

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
        if (!this.room.memory.roads) {
            this.room.memory.roads = [];
        }

        if (
            !this.memory.oldPosition ||
            this.memory.oldPosition.x !== this.pos.x ||
            this.memory.oldPosition.y !== this.pos.y
        ) {
            const roadIndex = this.room.memory.roads?.findIndex(
                (road) => road.x === this.pos.x && road.y === this.pos.y
            );

            if (roadIndex >= 0) {
                this.room.memory.roads[roadIndex].count++;
            } else {
                this.room.memory.roads.push({
                    x: this.pos.x,
                    y: this.pos.y,
                    count: 1,
                });
            }
        }

        this.memory.oldPosition = { x: this.pos.x, y: this.pos.y };
    }

    spawn(spawn: StructureSpawn) {
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

    sleep() {
        if (this.help()) {
            return;
        }
        this.memory.recycle = true;
        this.memory.recover = false;
        const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (!spawn) {
            this.moveHome();
        } else {
            if (!this.pos.isNearTo(spawn)) {
                this.say("😴 sleep");
                this.moveTo(spawn);
            }
        }
    }
    refresh() {
        const spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);

        this.memory.recycle = false;
        this.memory.recover = true;

        if (spawn) {
            this.moveTo(spawn);
        } else {
            this.moveHome();
        }

        return true;
    }

    moveHome() {
        const myRoom = this.memory.spawnRoom;
        const route = Game.map.findRoute(this.room.name, myRoom);
        const routeToMyRoom = this.pos.findClosestByRange(route[0]?.exit);

        this.moveTo(routeToMyRoom);

        return true;
    }

    help() {
        return false;
    }

    run() {
        return;
    }
}

export { RoleCreep };
