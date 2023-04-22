export const creepFC = () => {
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

    Creep.prototype.findMineralSource = function () {
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

    Creep.prototype.harvestMinerals = function () {
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
