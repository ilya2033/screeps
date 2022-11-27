export const creepFC = () => {
    Creep.prototype.findEnergySource = function () {
        const sources = this.room.find(FIND_SOURCES);
        if (sources.length) {
            const source = Object.values(sources).find((s) => s.pos.getOpenPositions().length > 0);
            if (source) {
                this.memory.sourceId = source.id;
                return source;
            }
        }
        return null;
    };
    Creep.prototype.findStorage = function (resourceType) {
        const storages = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER ||
                (structure.structureType === STRUCTURE_STORAGE &&
                    (resourceType
                        ? structure.storage.getUsedCapacity(resourceType)
                        : true)),
        });
        if (storages.length) {
            const freeStorages = Object.values(storages).filter((c) => c.pos.getOpenPositions().length > 0);
            const storage = this.findClosestByPath(freeStorages);
            if (storage) {
                this.memory.storageId = storage.id;
                return storage;
            }
        }
        return null;
    };
    Creep.prototype.harvestEnergy = function () {
        let storedSource = (Game.getObjectById(this.memory.sourceId));
        if (!storedSource ||
            (!storedSource.pos.getOpenPositions().length &&
                !this.pos.isNearTo(storedSource))) {
            delete this.memory.sourceId;
            storedSource = this.findEnergySource();
        }
        else {
            if (this.pos.isNearTo(storedSource)) {
                this.harvest(storedSource);
            }
            else {
                this.moveTo(storedSource, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                });
            }
        }
    };
};
