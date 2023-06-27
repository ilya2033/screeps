import { Controller } from "../controllers/Controller";

class StructureController extends Controller {
    struct: Structure;

    constructor(struct: Structure) {
        super();
        this.struct = struct;
    }

    // static getAllContollers<T extends StructureController>() {
    //     return Object.values(Game.creeps)
    //         .filter((creep: ICreep) => creep.memory.role === this.roleName)
    //         .map((creep: ICreep) => new this(creep)) as T[];
    // }
}

export { StructureController };
