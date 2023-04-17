import { ITower } from "../types/Tower";

const RoleTower = {
    ...{
        repair: function (creep: ITower) {
            const damagedStructures = creep.room.memory.damagedStructures.map(
                (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
            );

            if (damagedStructures.length) {
                const selectedDamagedStructure = creep.pos.findClosestByPath(
                    damagedStructures
                        .sort((a, b) => a.hits - b.hits)
                        .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
                );
                creep.repair(selectedDamagedStructure);
                return true;
            } else {
                return this.upgrade(creep);
            }
        },

        run: function (tower: ITower) {
            const closestHostile =
                tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

            if (closestHostile) {
                tower.attack(closestHostile);
            } else {
                this.repair(tower);
            }
        },
    },
};

export default RoleTower as unknown as ITower;
