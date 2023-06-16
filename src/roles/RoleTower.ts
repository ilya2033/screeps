import { ITower } from "../types/Tower";

class RoleTower extends StructureTower implements ITower {
    repairStructure() {
        const damagedStructures = this.room.memory.damagedStructures.map(
            (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
        );

        if (damagedStructures.length) {
            const selectedDamagedStructure = this.pos.findClosestByPath(
                damagedStructures
                    .sort((a, b) => a.hits - b.hits)
                    .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
            );
            this.repair(selectedDamagedStructure);
            return true;
        } else {
            return false;
        }
    }

    run() {
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            this.attack(closestHostile);
        } else {
            this.repairStructure();
        }
    }
}

export default RoleTower as unknown as ITower;
