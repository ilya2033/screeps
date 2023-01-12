const generalScript = function () {
    if (!Memory.needCreeps) {
        Memory.needCreeps = { builders: [], upgraders: [], solders: [] };
    }
    if (!Memory.powerBanks) {
        Memory.powerBanks = [];
    }

    if (!Memory.powerHuntingGroup) {
        Memory.powerHuntingGroup = [];
    }

    if (Memory.powerBanks?.length) {
        Memory.powerBanks = Memory.powerBanks?.filter(
            (roomId) =>
                Game.rooms[roomId]?.find(FIND_STRUCTURES, {
                    filter: { structureType: STRUCTURE_POWER_BANK },
                })?.length
        );
    }

    if (
        Game.cpu.getUsed() <= Game.cpu.limit / 1.5 &&
        Game.cpu.bucket >= 10000
    ) {
        Game.cpu.generatePixel();
    }
};

export { generalScript };
