import RoleWorker from "./RoleWorker";
import { IExcavator } from "../types/Excavator";
import { roomPositionFC } from "../functions/roomPositionFC";

const RoleExcavator = {
    ...RoleWorker,
    ...{
        roleName: "excavator",
        run: function (creep: IExcavator) {
            if (!this.runBasic(creep)) return;
            const selectedTarget = creep.room.storage;
            if (creep.store.getFreeCapacity()) {
                creep.harvestMinerals();
            } else {
                if (selectedTarget) {
                    if (creep.pos.isNearTo(selectedTarget)) {
                        creep.transfer(
                            selectedTarget,
                            //@ts-ignore
                            _.findKey(creep.store)
                        );
                    } else {
                        creep.moveTo(selectedTarget, {
                            visualizePathStyle: { stroke: "#ffffff" },
                        });
                    }
                }
            }

            if (!selectedTarget && creep.store.getFreeCapacity() === 0) {
                if (!this.repair(creep)) {
                    this.sleep(creep);
                }
            }
        },
    },
};

export default RoleExcavator as unknown as IExcavator;
