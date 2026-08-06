"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchServiceAsync = void 0;
const catchServiceAsync = (fn) => {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            console.error('Service Layer Error:', error);
            throw error;
        }
    });
};
exports.catchServiceAsync = catchServiceAsync;
