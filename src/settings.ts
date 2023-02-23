const conf = {
    structs: {
        wall: {
            MIN_HP: 700000,
            MAX_HP: 1000000,
        },
        controller: {
            ticksToDowngrade: {
                1: 20000,
                2: 10000,
                3: 20000,
                4: 40000,
                5: 80000,
                6: 120000,
                7: 150000,
                8: 200000,
            },
        },
    },
    creeps: {
        MAX_WARRIORS: 2,
        MAX_HARVESTERS: 4,
        MAX_ARCHERS: 3,
        MAX_BUILDERS: 1,
        MAX_UPGRADERS: 2,
        MAX_HEALERS: 2,
        MAX_SCOUTS: 0,

        MAX_TRACKS: 3,
        MIN_HARVESTERS: 2,
        MIN_UPGRADERS: 1,
        MIN_BUILDERS: 1,
        MIN_SCOUTS: 1,
    },
};

export default conf;
