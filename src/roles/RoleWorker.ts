import { roomPositionFC } from "../functions/roomPositionFC";
import { IWorker } from "../types/Worker";
import RoleCreep from "./RoleCreep";

const RoleWorker = {
    ...RoleCreep,
    ...{
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
        roleName: "worker",

        runBasic: function (creep: IWorker) {
            this.recordMove(creep);
            this.recordRoom(creep);
            if (
                creep.ticksToLive < 200 &&
                creep.room.energyAvailable >
                    creep.room.energyCapacityAvailable * 0.7
            ) {
                this.refresh(creep);
                return false;
            }
            if (creep.memory.recover) {
                if (
                    creep.ticksToLive < 1400 &&
                    creep.room.energyAvailable >
                        creep.room.energyCapacityAvailable * 0.7
                ) {
                    return false;
                }
                creep.memory.recover = false;
            }
            return true;
        },
        harvestEnergy: function (creep: IWorker) {
            let targets = [];
            let storedSource = null;

            storedSource = <Source | null>(
                Game.getObjectById(<Id<_HasId>>creep.memory.sourceId || null)
            );

            if (
                !storedSource ||
                (!storedSource.pos.getOpenPositions().length &&
                    !creep.pos.isNearTo(storedSource)) ||
                storedSource.room.name !== creep.room.name ||
                storedSource.energy === 0
            ) {
                delete creep.memory.sourceId;
                storedSource = creep.findEnergySource();
            }

            const closestDroppedEnergy = creep.pos.findClosestByPath(
                FIND_DROPPED_RESOURCES,
                {
                    filter: (r: Resource) =>
                        r.resourceType == RESOURCE_ENERGY &&
                        r.amount > 0 &&
                        r.pos.getOpenPositions().length,
                }
            );

            const closestRuinEnergy = creep.pos.findClosestByPath(FIND_RUINS, {
                filter: (r: Ruin) =>
                    r.pos.getOpenPositions().length &&
                    r.store[RESOURCE_ENERGY] > 0,
            });

            const closestTombEnergy = creep.pos.findClosestByPath(
                FIND_TOMBSTONES,
                {
                    filter: (r: Ruin) =>
                        r.pos.getOpenPositions().length &&
                        r.store[RESOURCE_ENERGY] > 0,
                }
            );
            if (
                closestDroppedEnergy ||
                closestRuinEnergy ||
                closestTombEnergy
            ) {
                targets[targets.length] =
                    closestDroppedEnergy ||
                    closestRuinEnergy ||
                    closestTombEnergy;
            }

            const closestStorage = creep.pos.findClosestByPath(
                creep.findStorages(RESOURCE_ENERGY),
                { filter: (st) => st.store[RESOURCE_ENERGY] > 0 }
            );

            const closestLink =
                creep.memory.role !== "track" &&
                creep.pos.findClosestByPath(FIND_STRUCTURES, {
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

            const target = creep.pos.findClosestByPath(targets);

            if (target) {
                if (creep.pos.isNearTo(target)) {
                    if (
                        creep.withdraw(target, RESOURCE_ENERGY) ===
                        ERR_INVALID_TARGET
                    ) {
                        if (creep.pickup(target) === ERR_INVALID_TARGET) {
                            creep.harvest(target);
                        }
                    }
                } else {
                    creep.moveTo(target, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
                return true;
            }
            return false;
        },
        findEnergySource: function (creep: IWorker) {
            const sources: Source[] = creep.room.find(FIND_SOURCES);

            if (sources.length) {
                const source = Object.values(sources).find(
                    (s) => s.pos.getOpenPositions().length > 0 && s.energy > 0
                );

                if (source) {
                    creep.memory.sourceId = source.id;
                    return source;
                } else {
                    const isNear = Object.values(sources).find(
                        (s) =>
                            s.pos.getOpenPositions().length === 0 &&
                            s.energy > 0 &&
                            creep.pos.isNearTo(s)
                    );
                    if (isNear) {
                        const openPositions = creep.pos.getOpenPositions();
                        if (openPositions?.length) {
                            creep.moveTo(openPositions[0]);
                        }
                    }
                }
            }
            return null;
        },

        upgrade: function (creep: IWorker) {
            if (creep.room.controller && creep.room.controller.my) {
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
                if (
                    creep.repair(selectedDamagedStructure) == ERR_NOT_IN_RANGE
                ) {
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
                    roomsToHelp = Memory.needCreeps[toHelpRoleName].filter(
                        (name) =>
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
    },
};

export default RoleWorker as unknown as IWorker;
