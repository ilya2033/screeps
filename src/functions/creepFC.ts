export const creepFC = () => {
    Creep.prototype.findEnergySource = function () {
        const sources: Source[] = this.room.find(FIND_SOURCES);
        if (sources.length) {
            const source = Object.values(sources).find(
                (s) => s.pos.getOpenPositions().length > 0 && s.energy > 0
            );

            if (source) {
                this.memory.sourceId = source.id;
                return source;
            }
        }
        return null;
    };

    Creep.prototype.findStorages = function (resourceType) {
        const storages: [StructureStorage | StructureContainer] =
            this.room.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_CONTAINER ||
                    (structure.structureType === STRUCTURE_STORAGE &&
                        (resourceType
                            ? structure?.storage?.getUsedCapacity(
                                  resourceType
                              ) || false
                            : true)),
            });

        if (storages.length) {
            return storages;
        }
        return null;
    };

    Creep.prototype.harvestEnergy = function () {
        let storedSource = <Source | null>(
            Game.getObjectById(this.memory.sourceId)
        );
        // const droppedEnergy = this.pos.findClosestByPath(
        //     FIND_DROPPED_RESOURCES,
        //     {
        //         filter: (r: Resource) =>
        //             r.resourceType == RESOURCE_ENERGY &&
        //             r.amount >= 50 &&
        //             r.pos.getOpenPositions().length,
        //     }
        // );

        // const ruinEnergy = this.pos.findClosestByPath(FIND_RUINS, {
        //     filter: (r: Ruin) =>
        //         r.store[RESOURCE_ENERGY] >= 50 &&
        //         r.pos.getOpenPositions().length,
        // });
        // if (droppedEnergy || ruinEnergy) {
        //     const toWithdraw = droppedEnergy || ruinEnergy;

        //     if (this.pos.isNearTo(toWithdraw)) {
        //         this.withdraw(toWithdraw, RESOURCE_ENERGY);
        //     } else {
        //         this.moveTo(toWithdraw, {
        //             visualizePathStyle: { stroke: "#ffaa00" },
        //         });
        //     }
        //     return;
        // }

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource))
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
            if (this.memory.role !== "harvester") {
                const closestStorage = this.pos.findClosestByPath(
                    this.findStorages(RESOURCE_ENERGY),
                    { filter: (st) => st.store[RESOURCE_ENERGY] }
                );
                if (this.pos.isNearTo(closestStorage)) {
                    this.harvest(closestStorage);
                } else {
                    this.moveTo(closestStorage, {
                        visualizePathStyle: { stroke: "#ffaa00" },
                    });
                }
            }
        } else {
            if (this.pos.isNearTo(storedSource)) {
                this.harvest(storedSource);
            } else {
                this.moveTo(storedSource, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    };

    Creep.prototype.moveToSpawnPoint = function (room) {
        let flag: Flag;
        if (room) {
            flag = Game.flags[`${room.name}-spawnPoint`];
        } else {
            flag = Game.flags[`${this.room.name}-spawnPoint`];
        }

        this.moveTo(flag);
    };

    Creep.prototype.moveToDefendPoint = function (room) {
        let flag: Flag;
        if (room) {
            flag = Game.flags[`${room.name}-defendPoint`];
        } else {
            flag = Game.flags[`${this.room.name}-defendPoint`];
        }

        this.moveTo(flag);
    };
};
