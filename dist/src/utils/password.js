"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashPassword(password) {
    const rounds = process.env.PASSWORD_HASH_ROUNDS;
    return await bcrypt_1.default.hash(password, rounds ? parseInt(rounds) : 15);
}
async function verifyPassword(password, encrypted) {
    return await bcrypt_1.default.compare(password, encrypted);
}
