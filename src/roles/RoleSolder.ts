import { ISolder } from "../types/Solder";

const RoleSolder = {
    defaultSetupT1: [ATTACK, TOUGH, MOVE],
    defaultSetupT2: [ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE],
    defaultSetupT3: [
        ATTACK,
        ATTACK,
        ATTACK,
        ATTACK,
        TOUGH,
        TOUGH,
        TOUGH,
        TOUGH,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
    ],
    roleName: "",
    spawn: function (spawn: StructureSpawn, basicParts = this.basicParts) {
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
                memory: { role: this.roleName },
            }
        );
    },

    sleep: function (creep: ISolder) {
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (!this.help(creep) && spawn) {
            creep.moveTo(spawn);
            creep.say("NOOOOO");
        }
    },
    help: function (creep: ISolder) {
        let roomsToHelp = [];
        let routeToRoomsToHelp = null;
        let roomsWithPower = [];
        let routeToRoomsWithPower = null;

        if (!creep) {
            return;
        }

        if (Memory.needCreeps.solders?.length) {
            roomsToHelp = Memory.needCreeps.solders.filter((name) =>
                Object.values(
                    Game.map.describeExits(creep.room.name) || []
                ).includes(name)
            );

            if (roomsToHelp.length) {
                const route = Game.map.findRoute(
                    creep.room.name,
                    roomsToHelp[0]
                );
                routeToRoomsToHelp = creep.pos.findClosestByRange(
                    route[0].exit
                );
            }
        }
        if (routeToRoomsToHelp) {
            creep.moveTo(routeToRoomsToHelp);
        }

        if (
            (Memory.powerBanks.length && creep.memory.role === "healer") ||
            creep.memory.role === "warrior"
        ) {
            roomsWithPower = Memory.powerBanks.filter((name) =>
                Object.values(
                    Game.map.describeExits(creep.room.name) || []
                ).includes(name)
            );
            if (creep.memory.role === "healer") {
                roomsWithPower = roomsWithPower.filter(
                    (roomName) =>
                        !Game.rooms[roomName].find(FIND_MY_CREEPS, {
                            filter: (creep) => creep.memory.role !== "healer",
                        })
                );
            }

            if (creep.memory.role === "warrior") {
                roomsWithPower = roomsWithPower.filter(
                    (roomName) =>
                        !Game.rooms[roomName].find(FIND_MY_CREEPS, {
                            filter: (creep) => creep.memory.role !== "warrior",
                        })
                );
            }
            if (roomsWithPower.length) {
                const route = Game.map.findRoute(
                    creep.room.name,
                    roomsWithPower[0]
                );
                routeToRoomsWithPower = creep.pos.findClosestByRange(
                    route[0].exit
                );
            }
        }
        if (routeToRoomsToHelp) {
            creep.moveTo(routeToRoomsToHelp);
            return true;
        } else if (routeToRoomsWithPower) {
            creep.moveTo(routeToRoomsWithPower);
            return true;
        }
        return false;
    },
};

export default RoleSolder as unknown as ISolder;
