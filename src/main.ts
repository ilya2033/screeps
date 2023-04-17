import { powerHuntingScript } from "./scripts/power.hunting";
import { generalScript } from "./scripts/general.main";
import { roomScript } from "./scripts/room.main";
import { creepsSpawnScript } from "./scripts/creeps.spawn";
import { runAllFC } from "./functions/runAllFC";

runAllFC();

export const loop = () => {
    generalScript();
    creepsSpawnScript();
    //powerHuntingScript();
    roomScript();
};
