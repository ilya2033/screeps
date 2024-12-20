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
        MAX_HARVESTERS: 5,
        MAX_ARCHERS: 3,
        MAX_BUILDERS: 1,
        MAX_UPGRADERS: 2,
        MAX_HEALERS: 2,
        MAX_SCOUTS: 0,

        MAX_TRACKS: 3,
        MIN_HARVESTERS: 3,
        MIN_UPGRADERS: 1,
        MIN_BUILDERS: 1,
        MIN_SCOUTS: 1,
    },
    resources: {
        NEED_TO_BY: [RESOURCE_CATALYZED_UTRIUM_ALKALIDE] as ResourceConstant[],
        BOOST_CREEPS: [
            RESOURCE_CATALYZED_UTRIUM_ALKALIDE,
        ] as ResourceConstant[],

        MIN: {
            [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: 5000,
        },

        MAX: {
            [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: 20000,
        },
    },
};

export default conf;
