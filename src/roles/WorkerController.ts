import { IWorker } from "../types/Worker";
import { CreepController } from "./CreepController";

class WorkerController extends CreepController {
    creep: IWorker;

    static roleName = "worker";
    static basicParts = <BodyPartConstant[]>[WORK, MOVE, CARRY];
    static defaultSetupT1 = <BodyPartConstant[]>[WORK, MOVE, CARRY];
    static defaultSetupT2 = <BodyPartConstant[]>[
        WORK,
        WORK,
        WORK,
        CARRY,
        CARRY,
        MOVE,
        MOVE,
        MOVE,
    ];
    static defaultSetupT3 = <BodyPartConstant[]>[
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
    static defaultSetupT4 = <BodyPartConstant[]>[
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
            this.creep.ticksToLive < 200 &&
            this.creep.room.energyAvailable >
                this.creep.room.energyCapacityAvailable * 0.7
        ) {
            this.refresh();
            return false;
        }
        if (this.creep.memory.recover) {
            if (
                this.creep.ticksToLive < 1400 &&
                this.creep.room.energyAvailable >
                    this.creep.room.energyCapacityAvailable * 0.7
            ) {
                return false;
            }
            this.creep.memory.recover = false;
        }
        return true;
    }
    harvestEnergy() {
        let targets = [];
        let storedSource = null;

        storedSource = <Source | null>(
            Game.getObjectById(<Id<_HasId>>this.creep.memory.sourceId || null)
        );

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.creep.pos.isNearTo(storedSource)) ||
            storedSource.room.name !== this.creep.room.name ||
            storedSource.energy === 0
        ) {
            delete this.creep.memory.sourceId;
            storedSource = this.creep.findEnergySource();
        }

        const closestDroppedEnergy = this.creep.pos.findClosestByPath(
            FIND_DROPPED_RESOURCES,
            {
                filter: (r: Resource) =>
                    r.resourceType == RESOURCE_ENERGY &&
                    r.amount > 0 &&
                    r.pos.getOpenPositions().length,
            }
        );

        const closestRuinEnergy = this.creep.pos.findClosestByPath(FIND_RUINS, {
            filter: (r: Ruin) =>
                r.pos.getOpenPositions().length && r.store[RESOURCE_ENERGY] > 0,
        });

        const closestTombEnergy = this.creep.pos.findClosestByPath(
            FIND_TOMBSTONES,
            {
                filter: (r: Ruin) =>
                    r.pos.getOpenPositions().length &&
                    r.store[RESOURCE_ENERGY] > 0,
            }
        );
        if (closestDroppedEnergy || closestRuinEnergy || closestTombEnergy) {
            targets[targets.length] =
                closestDroppedEnergy || closestRuinEnergy || closestTombEnergy;
        }

        const closestStorage = this.creep.pos.findClosestByPath(
            this.creep.findStorages(),
            {
                filter: (st) => st.store[RESOURCE_ENERGY] > 0,
            }
        );

        const closestLink =
            this.creep.memory.role !== "track" &&
            this.creep.pos.findClosestByPath(FIND_STRUCTURES, {
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

        const target = this.creep.pos.findClosestByPath(targets);

        if (target) {
            if (this.creep.pos.isNearTo(target)) {
                if (
                    this.creep.withdraw(target, RESOURCE_ENERGY) ===
                    ERR_INVALID_TARGET
                ) {
                    if (this.creep.pickup(target) === ERR_INVALID_TARGET) {
                        this.creep.harvest(target);
                    }
                }
            } else {
                this.creep.moveTo(target, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return true;
        }
        return false;
    }

    findEnergySource() {
        const sources: Source[] = this.creep.room.find(FIND_SOURCES);

        if (sources.length) {
            const source = Object.values(sources).find(
                (s) => s.pos.getOpenPositions().length > 0 && s.energy > 0
            );

            if (source) {
                this.creep.memory.sourceId = source.id;
                return source;
            } else {
                const isNear = Object.values(sources).find(
                    (s) =>
                        s.pos.getOpenPositions().length === 0 &&
                        s.energy > 0 &&
                        this.creep.pos.isNearTo(s)
                );
                if (isNear) {
                    const openPositions = this.creep.pos.getOpenPositions();
                    if (openPositions?.length) {
                        this.creep.moveTo(openPositions[0]);
                    }
                }
            }
        }
        return null;
    }

    upgrade() {
        if (this.creep.room.controller && this.creep.room.controller.my) {
            if (
                this.creep.upgradeController(this.creep.room.controller) ==
                ERR_NOT_IN_RANGE
            ) {
                this.creep.moveTo(this.creep.room.controller, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        }
        return false;
    }

    repairStructures() {
        const damagedStructures = this.creep.room.memory.damagedStructures.map(
            (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
        );
        const towers = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER },
        });

        if (damagedStructures.length && !towers.length) {
            const selectedDamagedStructure = this.creep.pos.findClosestByPath(
                damagedStructures
                    .sort((a, b) => a.hits - b.hits)
                    .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
            );
            if (
                this.creep.repair(selectedDamagedStructure) == ERR_NOT_IN_RANGE
            ) {
                this.creep.moveTo(selectedDamagedStructure, {
                    visualizePathStyle: { stroke: "#ffffff" },
                });
            }
            return true;
        } else {
            return this.upgrade();
        }
    }

    harvestFromOtherRooms() {
        let rooms = this.creep.room.memory.nearRooms
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
            rooms = this.creep.room.memory.nearRooms
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
            const routes = Game.map.findRoute(this.creep.room.name, rooms[0]);

            const closestRoute = this.creep.pos.findClosestByRange(
                routes[0]?.exit
            );
            if (closestRoute) {
                this.creep.moveTo(closestRoute);
            }
        }
    }

    findStorages() {
        const storages: [StructureStorage | StructureContainer] =
            this.creep.room.find(FIND_STRUCTURES, {
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
        const toHelpRoleName = `${WorkerController.roleName}s`;
        if (
            Memory.powerBanks.length &&
            this.creep.memory.role === "harvester" &&
            Memory.powerHuntingGroup?.length >= 3 &&
            Memory.powerHuntingGroup?.includes(this.creep.name)
        ) {
            const roomsWithPower = Memory.powerBanks.filter(
                (name) => Game.rooms[name]
            );

            if (roomsWithPower.length) {
                const route = Game.map.findRoute(
                    this.creep.room.name,
                    roomsWithPower[0]
                );
                const routeToRoomsWithPower = this.creep.pos.findClosestByRange(
                    route[0].exit
                );
                this.creep.moveTo(routeToRoomsWithPower);
            }
            return true;
        } else {
            if (Memory.needCreeps[toHelpRoleName]?.length) {
                roomsToHelp = Memory.needCreeps[toHelpRoleName].filter((name) =>
                    Object.values(
                        Game.map.describeExits(this.creep.room.name) || []
                    ).includes(name)
                );

                if (roomsToHelp.length) {
                    const route = Game.map.findRoute(
                        this?.creep.room.name,
                        roomsToHelp[0]
                    );
                    routeToRoomsToHelp = this.creep.pos.findClosestByRange(
                        route[0].exit
                    );
                }

                if (routeToRoomsToHelp) {
                    this.creep.moveTo(routeToRoomsToHelp, {
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
            Game.getObjectById(this.creep.memory.mineralId)
        );

        if (
            !storedMineral ||
            (!storedMineral.pos.getOpenPositions().length &&
                !this.creep.pos.isNearTo(storedMineral)) ||
            storedMineral.room.name !== this.creep.room.name ||
            storedMineral.mineralAmount === 0
        ) {
            delete this.creep.memory.mineralId;
            storedMineral = this.creep.findMineralSource();
        }

        if (storedMineral) {
            if (this.creep.pos.isNearTo(storedMineral)) {
                this.creep.harvest(storedMineral);
            } else {
                this.creep.moveTo(storedMineral, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    }

    findMineralSource() {
        const sources: Mineral[] = this.creep.room.find(FIND_MINERALS);

        if (sources.length) {
            const source = Object.values(sources).find(
                (s) =>
                    s.pos.getOpenPositions().length > 0 && s.mineralAmount > 0
            );

            if (source) {
                this.creep.memory.mineralId = source.id;
                return source;
            }
        }
        return null;
    }
}

export { WorkerController };
