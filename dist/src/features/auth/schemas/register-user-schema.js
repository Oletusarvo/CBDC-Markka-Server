"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const password_schema_1 = require("./password-schema");
exports.userSchema = zod_1.default
    .object({
    email: zod_1.default
        .email()
        .trim()
        .refine(email => {
        const domain = email.split('@').at(1);
        return domain === 'gmail.com';
    }, { error: 'auth:invalid_email_domain' }),
    password1: password_schema_1.passwordSchema,
    password2: zod_1.default.string(),
})
    .refine(user => user.password1 === user.password2, { error: 'Passwords do not match!' });
