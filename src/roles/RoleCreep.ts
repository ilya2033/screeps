import { createProject } from "../../node_modules/gulp-typescript/release/main";
import { ICreep } from "../types/Creep";

const RoleCreep = {
    roleName: "",

    record(creep: ICreep) {
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
                memory: { role: this.roleName, recover: false },
            }
        );
    },

    sleep: function (creep: ICreep) {
        if (this.help(creep)) {
            return;
        }
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);

        if (!creep.pos.isNearTo(spawn)) {
            creep.say("😴 sleep");
            creep.moveTo(spawn);
        }
    },
    refresh: function (creep: ICreep) {
        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            creep.moveTo(spawn);
            creep.memory.recover = true;

            return true;
        }

        return false;
    },
};

export default RoleCreep as unknown as ICreep;
