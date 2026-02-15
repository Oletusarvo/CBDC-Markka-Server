"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJWT = createJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const load_env_variable_1 = require("./load-env-variable");
function createJWT(payload, options) {
    const secret = (0, load_env_variable_1.loadEnvVariable)('TOKEN_SECRET');
    return jsonwebtoken_1.default.sign(payload, secret, options);
}
