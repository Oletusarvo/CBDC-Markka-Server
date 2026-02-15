"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = exports.createHandler = void 0;
const try_catch_1 = require("./try-catch");
const runHandler = async (res, handler, onError) => {
    const [result, err] = await (0, try_catch_1.tryCatch)(async () => await handler());
    if (err !== null) {
        console.log(err.message);
        const errorResponse = onError ? onError(err, res) : null;
        if (errorResponse) {
            return errorResponse;
        }
        return res.status(500).end();
    }
    return result;
};
/**
 * Creates a route-handler that internally catches errors.
 * @param handler
 * @param onError
 * @returns
 */
function createHandler(handler, onError) {
    return async (req, res) => {
        return await runHandler(res, async () => await handler(req, res), onError);
    };
}
exports.createHandler = createHandler;
/**
 * Creates a middleware-function that internally catches errors.
 * @param handler
 * @returns
 */
function createMiddleware(handler, onError) {
    return async (req, res, next) => {
        return await runHandler(res, async () => await handler(req, res, next), onError);
    };
}
exports.createMiddleware = createMiddleware;
