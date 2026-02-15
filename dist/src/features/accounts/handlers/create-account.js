"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = void 0;
const create_handler_1 = require("../../../utils/create-handler");
/**Creates a new account for the authenticated user. */
exports.createAccount = (0, create_handler_1.createHandler)(async (req, res) => {
    return res.status(200).end();
}, (err, res) => {
    return res.status(500).end();
});
