"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const load_env_variable_1 = require("./load-env-variable");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashPassword(pass) {
    const rounds = (0, load_env_variable_1.loadEnvVariable)('PASSWORD_HASH_ROUNDS', false);
    return await bcrypt_1.default.hash(pass, rounds ? parseInt(rounds) : 15);
}
