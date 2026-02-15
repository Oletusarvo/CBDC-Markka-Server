"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = void 0;
async function tryCatch(callback) {
    try {
        const res = await callback();
        return [res, null];
    }
    catch (err) {
        return [null, err];
    }
}
exports.tryCatch = tryCatch;
