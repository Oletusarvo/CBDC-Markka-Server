"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.passwordSchema = zod_1.default
    .string()
    .refine(pass => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(pass), 'Passwords must have upper- and lowecase letters, numbers and special characters!');
