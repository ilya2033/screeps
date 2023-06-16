import { Controller } from "./Controller";

class StructureController extends Controller {
    struct: Structure;

    constructor(struct: Structure) {
        super();
        this.struct = struct;
    }
}

export { StructureController };
