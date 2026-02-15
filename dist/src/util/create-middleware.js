"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = createMiddleware;
const try_catch_1 = require("./try-catch");
function createMiddleware(handler) {
    return async (req, res, next) => {
        const [result, error] = await (0, try_catch_1.tryCatch)(async () => await handler(req, res, next));
        if (error !== null) {
            console.log(error);
            return res.status(500).send('An unexpected error occured!');
        }
        return result;
    };
}
