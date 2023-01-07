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

    Creep.prototype.findPowerBank = function () {
        const powerBanks: StructurePowerBank[] = this.room.find(
            FIND_STRUCTURES,
            {
                filter: (st: Structure) =>
                    st.structureType === STRUCTURE_POWER_BANK,
            }
        );

        if (powerBanks.length) {
            const powerBank = Object.values(powerBanks).find(
                (s) => s.pos.getOpenPositions().length > 0
            );

            if (powerBank) {
                this.memory.powerBankId = powerBank.id;
                return powerBank;
            }
        }
        return null;
    };

    Creep.prototype.findStorages = function () {
        const storages: [StructureStorage | StructureContainer] =
            this.room.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.structureType === STRUCTURE_CONTAINER ||
                    structure.structureType === STRUCTURE_STORAGE,
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
                !this.pos.isNearTo(storedSource)) ||
            storedSource.room.name !== this.room.name ||
            storedSource.energy === 0
        ) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
        }

        let targets = [];
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

        if (closestDroppedEnergy || closestRuinEnergy) {
            targets[targets.length] = closestDroppedEnergy || closestRuinEnergy;
        }

        if (this.memory.role !== "harvester") {
            const closestStorage = this.pos.findClosestByPath(
                this.findStorages(RESOURCE_ENERGY),
                { filter: (st) => st.store[RESOURCE_ENERGY] > 0 }
            );

            const closestLink = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (st) =>
                    st.structureType === STRUCTURE_LINK && st.capacity > 0,
            });

            if (closestLink) {
                targets[targets.length] = closestLink;
            }

            if (closestStorage && !storedSource) {
                targets[targets.length] = closestStorage;
            }
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
                    if (
                        this.pickup(target, RESOURCE_ENERGY) ===
                        ERR_INVALID_TARGET
                    ) {
                        this.harvest(target);
                    }
                }
            } else {
                this.moveTo(target, {
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
