"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvVariable = void 0;
function loadEnvVariable(name, throwErrorOnUndefined = true) {
    const val = process.env[name];
    if (!val && throwErrorOnUndefined) {
        throw new Error(`${name} env-variable missing!`);
    }
    return val;
}
exports.loadEnvVariable = loadEnvVariable;
