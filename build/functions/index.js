"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomPositionFC = exports.creepFC = exports.runAllFC = void 0;
const roomPositionFC_1 = require("./roomPositionFC");
Object.defineProperty(exports, "roomPositionFC", { enumerable: true, get: function () { return roomPositionFC_1.roomPositionFC; } });
const creepFC_1 = require("./creepFC");
Object.defineProperty(exports, "creepFC", { enumerable: true, get: function () { return creepFC_1.creepFC; } });
const runAllFC = () => {
    (0, creepFC_1.creepFC)();
    (0, roomPositionFC_1.roomPositionFC)();
};
exports.runAllFC = runAllFC;
