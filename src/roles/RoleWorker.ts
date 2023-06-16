import { IWorker, IWorkerMemory } from "../types/Worker";
import { RoleCreep } from "./RoleCreep";

class RoleWorker extends RoleCreep implements IWorker {
    memory: IWorkerMemory;

    roleName = "worker";
    basicParts = <BodyPartConstant[]>[WORK, MOVE, CARRY];
    defaultSetupT1 = <BodyPartConstant[]>[WORK, MOVE, CARRY];
    defaultSetupT2 = <BodyPartConstant[]>[
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
    ];
    defaultSetupT3 = <BodyPartConstant[]>[
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
    ];
    defaultSetupT4 = <BodyPartConstant[]>[
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
    ];

    runBasic() {
        this.recordMove();
        this.recordRoom();
        if (
            this.ticksToLive < 200 &&
            this.room.energyAvailable > this.room.energyCapacityAvailable * 0.7
        ) {
            this.refresh();
            return false;
        }
        if (this.memory.recover) {
            if (
                this.ticksToLive < 1400 &&
                this.room.energyAvailable >
                    this.room.energyCapacityAvailable * 0.7
            ) {
                return false;
            }
            this.memory.recover = false;
        }
        return true;
    }
    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        storedSource = <Source | null>(
            Game.getObjectById(<Id<_HasId>>this.memory.sourceId || null)
        );

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource)) ||
            storedSource.room.name !== this.room.name ||
            storedSource.energy === 0
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
        }

        const closestDroppedEnergy = this.pos.findClosestByPath(
            FIND_DROPPED_RESOURCES,
            {
                filter: (r: Resource) =>
                    r.resourceType == RESOURCE_ENERGY &&
                    r.amount > 0 &&
                    r.pos.getOpenPositions().length,
            }
        );

        const closestRuinEnergy = this.pos.findClosestByPath(FIND_RUINS, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });

        const closestTombEnergy = this.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });
        if (closestDroppedEnergy || closestRuinEnergy || closestTombEnergy) {
            targets[targets.length] =
                closestDroppedEnergy || closestRuinEnergy || closestTombEnergy;
        }

        const closestStorage = this.pos.findClosestByPath(this.findStorages(), {
            filter: (st) => st.store[RESOURCE_ENERGY] > 0,
        });

        const closestLink =
            this.memory.role !== "track" &&
            this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (st) =>
                    st.structureType === STRUCTURE_LINK &&
                    st.store[RESOURCE_ENERGY] > 0,
            });

        if (closestLink) {
            targets[targets.length] = closestLink;
        }

        if (closestStorage && !storedSource) {
            targets[targets.length] = closestStorage;
        }

        if (storedSource) {
            targets[targets.length] = storedSource;
        }

        const target = this.pos.findClosestByPath(targets);

        if (target) {
            if (this.pos.isNearTo(target)) {
                if (
                    this.withdraw(target, RESOURCE_ENERGY) ===
                    ERR_INVALID_TARGET
                ) {
                    if (this.pickup(target) === ERR_INVALID_TARGET) {
                        this.harvest(target);
                    }
                }
            } else {
                this.moveTo(target, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return true;
        }
        return false;
    }

    findEnergySource() {
        const sources: Source[] = this.room.find(FIND_SOURCES);

        if (sources.length) {
            const source = Object.values(sources).find(
                (s) => s.pos.getOpenPositions().length > 0 && s.energy > 0
            );

            if (source) {
                this.memory.sourceId = source.id;
                return source;
            } else {
                const isNear = Object.values(sources).find(
                    (s) =>
                        s.pos.getOpenPositions().length === 0 &&
                        s.energy > 0 &&
                        this.pos.isNearTo(s)
                );
                if (isNear) {
                    const openPositions = this.pos.getOpenPositions();
                    if (openPositions?.length) {
                        this.moveTo(openPositions[0]);
                    }
                }
            }
        }
        return null;
    }

    upgrade() {
        if (this.room.controller && this.room.controller.my) {
            if (
                this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE
            ) {
                this.moveTo(this.room.controller, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        }
        return false;
    }

    repairStructures() {
        const damagedStructures = this.room.memory.damagedStructures.map(
            (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
        );
        const towers = this.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER },
        });

        if (damagedStructures.length && !towers.length) {
            const selectedDamagedStructure = this.pos.findClosestByPath(
                damagedStructures
                    .sort((a, b) => a.hits - b.hits)
                    .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
            );
            if (this.repair(selectedDamagedStructure) == ERR_NOT_IN_RANGE) {
                this.moveTo(selectedDamagedStructure, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        } else {
            return this.upgrade();
        }
    }

    harvestFromOtherRooms() {
        let rooms = this.room.memory.nearRooms
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
            rooms = this.room.memory.nearRooms
                .reduce((acc: string[], roomName: string) => {
                    const nearRooms = Memory.rooms[roomName]?.nearRooms;
                    if (nearRooms?.length) {
                        console.log({ acc, nearRooms });
                        return [...new Set([...acc, ...nearRooms])];
                    }
                    return acc;
                }, [])
                .filter(
                    (roomName: string) =>
                        !Memory.rooms[roomName]?.owner &&
                        Memory.rooms[roomName]?.controller
                )
                .filter((roomName: string) =>
                    Game.rooms[roomName]
                        ? Game.rooms[roomName]
                              .find(FIND_SOURCES)
                              .some((source) => source.pos.getOpenPositions())
                        : true
                );
        }

        if (rooms.length) {
            const routes = Game.map.findRoute(this.room.name, rooms[0]);

            const closestRoute = this.pos.findClosestByRange(routes[0]?.exit);
            if (closestRoute) {
                this.moveTo(closestRoute);
            }
        }
    }

    findStorages() {
        const storages: [StructureStorage | StructureContainer] =
            this.room.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_CONTAINER ||
                    structure.structureType === STRUCTURE_STORAGE,
            }) as [StructureStorage | StructureContainer];

        if (storages.length) {
            return storages;
        }
        return null;
    }

    help() {
        let roomsToHelp = [];
        let routeToRoomsToHelp = null;
        const toHelpRoleName = `${this.roleName}s`;
        if (
            Memory.powerBanks.length &&
            this.memory.role === "harvester" &&
            Memory.powerHuntingGroup?.length >= 3 &&
            Memory.powerHuntingGroup?.includes(this.name)
        ) {
            const roomsWithPower = Memory.powerBanks.filter(
                (name) => Game.rooms[name]
            );

            if (roomsWithPower.length) {
                const route = Game.map.findRoute(
                    this.room.name,
                    roomsWithPower[0]
                );
                const routeToRoomsWithPower = this.pos.findClosestByRange(
                    route[0].exit
                );
                this.moveTo(routeToRoomsWithPower);
            }
            return true;
        } else {
            if (Memory.needCreeps[toHelpRoleName]?.length) {
                roomsToHelp = Memory.needCreeps[toHelpRoleName].filter((name) =>
                    Object.values(
                        Game.map.describeExits(this?.room.name) || []
                    ).includes(name)
                );

                if (roomsToHelp.length) {
                    const route = Game.map.findRoute(
                        this?.room.name,
                        roomsToHelp[0]
                    );
                    routeToRoomsToHelp = this.pos.findClosestByRange(
                        route[0].exit
                    );
                }

                if (routeToRoomsToHelp) {
                    this.moveTo(routeToRoomsToHelp, {
                        visualizePathStyle: { stroke: "#ffffff" },
                    });
                    return true;
                }
            }
        }

        return false;
    }

    harvestMinerals() {
        let storedMineral = null;
        storedMineral = <Mineral | null>(
            Game.getObjectById(this.memory.mineralId)
        );

        if (
            !storedMineral ||
            (!storedMineral.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedMineral)) ||
            storedMineral.room.name !== this.room.name ||
            storedMineral.mineralAmount === 0
        ) {
            delete this.memory.mineralId;
            storedMineral = this.findMineralSource();
        }

        if (storedMineral) {
            if (this.pos.isNearTo(storedMineral)) {
                this.harvest(storedMineral);
            } else {
                this.moveTo(storedMineral, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    }

    findMineralSource() {
        const sources: Mineral[] = this.room.find(FIND_MINERALS);

        if (sources.length) {
            const source = Object.values(sources).find(
                (s) =>
                    s.pos.getOpenPositions().length > 0 && s.mineralAmount > 0
            );

            if (source) {
                this.memory.mineralId = source.id;
                return source;
            }
        }
        return null;
    }
}

export { RoleWorker };
