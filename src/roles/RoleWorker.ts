import { IWorker } from "../types/Worker";

const RoleWorker = {
    basicParts: [WORK, MOVE, CARRY],
    defaultSetupT1: [WORK, MOVE, CARRY],
    defaultSetupT2: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
    defaultSetupT3: [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
    ],
    defaultSetupT4: [
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        CARRY,
    ],
    roleName: "",
    spawn: function (spawn, basicParts = this.basicParts) {
        let setup = this.defaultSetupT1;

        if (basicParts) {
            const bodyCost = basicParts.reduce(function (cost, part) {
                return cost + BODYPART_COST[part];
            }, 0);
            let energy = spawn.room.energyAvailable;
            setup = [];
            while (energy >= bodyCost) {
                setup = [...setup, ...basicParts];
                energy = energy - bodyCost;
            }
            if (setup.length === 0) {
                basicParts = null;
            }
        }

        if (
            spawn.room.energyAvailable === spawn.room.energyCapacityAvailable &&
            !basicParts
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

        spawn.spawnCreep(
            setup,
            `${this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1)}${
                Game.time
            }`,
            {
                memory: { role: this.roleName, recover: false },
            }
        );
    },

    runBasic: function (creep: IWorker) {
        if (creep.ticksToLive < 200) {
            this.refresh(creep);
            return false;
        }
        if (creep.memory.recover) {
            if (creep.ticksToLive < 1400) {
                return false;
            }
            creep.memory.recover = false;
        }
        return true;
    },

    sleep: function (creep: IWorker) {
        if (this.help()) {
            return;
        }
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);

        if (!creep.pos.isNearTo(spawn)) {
            creep.say("😴 sleep or deat..");
            creep.moveToSpawnPoint();
        }
    },
    upgrade: function (creep: IWorker) {
        if (creep.room.controller) {
            if (
                creep.upgradeController(creep.room.controller) ==
                ERR_NOT_IN_RANGE
            ) {
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        }
        return false;
    },
    repair: function (creep: IWorker) {
        const damagedStructures = creep.room.memory.damagedStructures.map(
            (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
        );
        const towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER },
        });

        if (damagedStructures.length && !towers.length) {
            const selectedDamagedStructure = creep.pos.findClosestByPath(
                damagedStructures
                    .sort((a, b) => a.hits - b.hits)
                    .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
            );
            if (creep.repair(selectedDamagedStructure) == ERR_NOT_IN_RANGE) {
                creep.moveTo(selectedDamagedStructure, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        } else {
            return this.upgrade(creep);
        }
    },
    help: function (creep: IWorker) {
        let roomsToHelp = [];
        let routeToRoomsToHelp = null;
        const toHelpRoleName = `${this.roleName}s`;
        if (
            Memory.powerBanks.length &&
            creep.memory.role === "harvester" &&
            Memory.powerHuntingGroup?.length >= 3 &&
            Memory.powerHuntingGroup?.includes(creep.name)
        ) {
            const roomsWithPower = Memory.powerBanks.filter(
                (name) => Game.rooms[name]
            );

            if (roomsWithPower.length) {
                const route = Game.map.findRoute(
                    creep.room.name,
                    roomsWithPower[0]
                );
                const routeToRoomsWithPower = creep.pos.findClosestByRange(
                    route[0].exit
                );
                creep.moveTo(routeToRoomsWithPower);
            }
            return true;
        } else {
            if (Memory.needCreeps[toHelpRoleName]?.length) {
                roomsToHelp = Memory.needCreeps[toHelpRoleName].filter((name) =>
                    Object.values(
                        Game.map.describeExits(creep?.room.name) || []
                    ).includes(name)
                );

                if (roomsToHelp.length) {
                    const route = Game.map.findRoute(
                        creep?.room.name,
                        roomsToHelp[0]
                    );
                    routeToRoomsToHelp = creep.pos.findClosestByRange(
                        route[0].exit
                    );
                }

                if (routeToRoomsToHelp) {
                    creep.moveTo(routeToRoomsToHelp, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                    return true;
                }
            }
        }

        return false;
    },
    refresh: function (creep: IWorker) {
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            creep.moveTo(spawn);
            creep.memory.recover = true;

            return true;
        }

        return false;
    },
};

export default RoleWorker as unknown as IWorker;
