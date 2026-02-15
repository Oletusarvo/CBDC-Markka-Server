"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = tryCatch;
async function tryCatch(callback) {
    try {
        const res = await callback();
        return [res, null];
    }
    catch (err) {
        return [null, err];
    }
}
