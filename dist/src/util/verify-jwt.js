"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
const load_env_variable_1 = require("./load-env-variable");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyJWT(token) {
    const secret = (0, load_env_variable_1.loadEnvVariable)('TOKEN_SECRET');
    return jsonwebtoken_1.default.verify(token, secret);
}
