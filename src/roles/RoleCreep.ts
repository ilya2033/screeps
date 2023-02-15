import { ICreep } from "../types/Creep";

const RoleCreep = {
    roleName: "",
    recordRoom: (creep: ICreep) => {
        const room = creep.room;
        Memory.rooms[room.name] = {
            ...Memory.rooms[room.name],
            ...{
                owner: !!room.controller?.owner,
                controller: !!room.controller,
                lastChecked: Game.time,
            },
        };
    },

    harvestFromOtherRooms: function (creep: ICreep) {
        let rooms = creep.room.memory.nearRooms
            .filter(
                (roomName) =>
                    !Memory.rooms[roomName]?.owner &&
                    Memory.rooms[roomName]?.controller
            )
            .filter((roomName) =>
                Game.rooms[roomName]
                    ? Game.rooms[roomName]
                          .find(FIND_SOURCES)
                          .some((source) => source.pos.getOpenPositions())
                    : true
            );
        if (!rooms.length) {
            rooms = creep.room.memory.nearRooms
                .reduce((acc, roomName) => {
                    const nearRooms = Memory.rooms[roomName]?.nearRooms;
                    if (nearRooms?.length) {
                        console.log({ acc, nearRooms });
                        return [...new Set([...acc, ...nearRooms])];
                    }
                    return acc;
                }, [])
                .filter(
                    (roomName) =>
                        !Memory.rooms[roomName]?.owner &&
                        Memory.rooms[roomName]?.controller
                )
                .filter((roomName) =>
                    Game.rooms[roomName]
                        ? Game.rooms[roomName]
                              .find(FIND_SOURCES)
                              .some((source) => source.pos.getOpenPositions())
                        : true
                );
        }

        if (rooms.length) {
            const routes = Game.map.findRoute(creep.room.name, rooms[0]);

            const closestRoute = creep.pos.findClosestByRange(routes[0]?.exit);
            if (closestRoute) {
                creep.moveTo(closestRoute);
            }
        }
    },
    recordMove(creep: ICreep) {
        if (!creep.room.memory.roads) {
            creep.room.memory.roads = [];
        }
        if (
            !creep.memory.oldPosition ||
            creep.memory.oldPosition.x !== creep.pos.x ||
            creep.memory.oldPosition.y !== creep.pos.y
        ) {
            const roadIndex = creep.room.memory.roads?.findIndex(
                (road) => road.x === creep.pos.x && road.y === creep.pos.y
            );
            if (roadIndex >= 0) {
                creep.room.memory.roads[roadIndex].count++;
            } else {
                creep.room.memory.roads.push({
                    x: creep.pos.x,
                    y: creep.pos.y,
                    count: 1,
                });
            }
        }
        creep.memory.oldPosition = { x: creep.pos.x, y: creep.pos.y };
    },

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
                memory: {
                    role: this.roleName,
                    recover: false,
                    spawnRoom: spawn.room.name,
                    recycle: false,
                },
            }
        );
    },

    sleep: function (creep: ICreep) {
        if (this.help(creep)) {
            return;
        }
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (!spawn) {
            this.moveHome(creep);
        } else {
            if (!creep.pos.isNearTo(spawn)) {
                creep.say("😴 sleep");
                creep.moveTo(spawn);
            }
        }
    },
    refresh: function (creep: ICreep) {
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            creep.moveTo(spawn);
            creep.memory.recover = true;
        } else {
            this.moveHome(creep);
        }
        return true;
    },
    moveHome: function (creep: ICreep) {
        const myRoom = creep.memory.spawnRoom;

        const route = Game.map.findRoute(creep.room.name, myRoom);
        const routeToMyRoom = creep.pos.findClosestByRange(route[0].exit);
        creep.moveTo(routeToMyRoom);
        return true;
    },
};

export default RoleCreep as unknown as ICreep;
