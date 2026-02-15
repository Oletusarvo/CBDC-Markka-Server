"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJWT = createJWT;
exports.verifyJWT = verifyJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getSecret = () => process.env.TOKEN_SECRET;
function createJWT(payload, options) {
    return jsonwebtoken_1.default.sign(payload, getSecret(), options);
}
function verifyJWT(token) {
    return jsonwebtoken_1.default.verify(token, getSecret());
}
