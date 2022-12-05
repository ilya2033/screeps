import { ITower } from "../types/Tower";

const RoleTower = {
    run: (tower: ITower) => {
        const closestHostile =
            tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            tower.attack(closestHostile);
        }
    },
};

export default RoleTower as unknown as ITower;
