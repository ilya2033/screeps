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

        if (
            !storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource))
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
        }

        let targets = [];

        if (this.memory.role !== "harvester") {
            const closestStorage = this.pos.findClosestByPath(
                this.findStorages(RESOURCE_ENERGY),
                { filter: (st) => st.store[RESOURCE_ENERGY] }
            );
            const closestLink = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (st) =>
                    st.structureType === STRUCTURE_LINK && st.capacity > 0,
            });

            if (closestStorage) {
                targets[targets.length] = closestStorage;
            }
            if (closestLink) {
                targets[targets.length] = closestLink;
            }
        }
        if (storedSource) {
            targets[targets.length] = storedSource;
        }

        const closestTarget = this.pos.findClosestByPath(targets);

        if (closestTarget) {
            if (this.pos.isNearTo(closestTarget)) {
                this.harvest(closestTarget);
            } else {
                this.moveTo(closestTarget, {
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
