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
