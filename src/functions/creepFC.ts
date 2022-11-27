export const creepFC = () => {
    Creep.prototype.findEnergySource = function () {
        const sources: Source[] = this.room.find(FIND_SOURCES);
        if (sources.length) {
            const source = Object.values(sources).find(
                (s) => s.pos.getOpenPositions().length > 0
            );

            if (source) {
                this.memory.sourceId = source.id;
                return source;
            }
        }
        return null;
    };

    Creep.prototype.findStorage = function (resourceType) {
        const storages: [StructureStorage | StructureContainer] =
            this.room.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_CONTAINER ||
                    (structure.structureType === STRUCTURE_STORAGE &&
                        (resourceType
                            ? structure.storage.getUsedCapacity(resourceType)
                            : true)),
            });

        if (storages.length) {
            const freeStorages = Object.values(storages).filter(
                (c) => c.pos.getOpenPositions().length > 0
            );
            const storage = this.findClosestByPath(freeStorages);

            if (storage) {
                this.memory.storageId = storage.id;
                return storage;
            }
        }
        return null;
    };

    Creep.prototype.harvestEnergy = function () {
        let storedSource = <Source | null>(
            Game.getObjectById(this.memory.sourceId)
        );
        const droppedEnergy = this.pos.findClosestByPath(
            FIND_DROPPED_RESOURCES,
            {
                filter: (r: Resource) =>
                    r.resourceType == RESOURCE_ENERGY &&
                    r.amount >= 50 &&
                    r.pos.getOpenPositions().length,
            }
        );

        const ruinEnergy = this.pos.findClosestByPath(FIND_RUINS, {
            filter: (r: Ruin) =>
                r.store[RESOURCE_ENERGY] >= 50 &&
                r.pos.getOpenPositions().length,
        });
        if (droppedEnergy || ruinEnergy) {
            const toWithdraw = droppedEnergy || ruinEnergy;

            if (this.pos.isNearTo(toWithdraw)) {
                this.withdraw(toWithdraw, RESOURCE_ENERGY);
            } else {
                this.moveTo(toWithdraw, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
            return;
        }

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource))
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
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
            flag = Game.flags[`${room}-spawnPoint`];
        } else {
            flag = Game.flags[`${this.room}-spawnPoint`];
        }

        this.moveTo(flag);
    };
};
