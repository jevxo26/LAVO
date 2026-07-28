"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.setIO = void 0;
let _io = null;
const setIO = (io) => {
    _io = io;
};
exports.setIO = setIO;
const getIO = () => {
    if (!_io)
        throw new Error('Socket.io not initialized! Call setIO() first.');
    return _io;
};
exports.getIO = getIO;
