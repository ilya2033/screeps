import { StructureController } from "./StructureController";

class TowerController extends StructureController {
    struct: StructureTower;
    repairStructure() {
        const damagedStructures = this.struct.room.memory.damagedStructures.map(
            (ds_id: Id<Structure>) => Game.getObjectById(ds_id)
        );

        if (damagedStructures.length) {
            const selectedDamagedStructure = this.struct.pos.findClosestByPath(
                damagedStructures
                    .sort((a, b) => a.hits - b.hits)
                    .filter((st, non, arr) => st.hits <= arr[0].hits * 1.3)
            );
            this.struct.repair(selectedDamagedStructure);
            return true;
        } else {
            return false;
        }
    }

    run() {
        const closestHostile =
            this.struct.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (closestHostile) {
            this.struct.attack(closestHostile);
        } else {
            this.repairStructure();
        }
    }
}

export { TowerController };
