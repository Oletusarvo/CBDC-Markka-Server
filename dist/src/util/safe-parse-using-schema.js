"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParseUsingSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const safeParseUsingSchema = (payload, schema) => {
    const parseResult = schema.safeParse(payload);
    return !parseResult.success
        ? [null, zod_1.default.treeifyError(parseResult.error)]
        : [parseResult.data, null];
};
exports.safeParseUsingSchema = safeParseUsingSchema;
