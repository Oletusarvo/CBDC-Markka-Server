"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBodyParser = void 0;
const zod_1 = __importDefault(require("zod"));
const create_handler_1 = require("./create-handler");
/**
 * Generates a middleware-function using the provided zod-schema to validate the body of requests, including it as the data-parameter of the request.
 * @param schema
 * @returns
 */
function createBodyParser(schema) {
    return (0, create_handler_1.createMiddleware)(async (req, res, next) => {
        console.log(req.body);
        const parseResult = schema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(zod_1.default.treeifyError(parseResult.error));
        }
        req.data = parseResult.data;
        next();
    });
}
exports.createBodyParser = createBodyParser;
