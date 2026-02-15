"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionHandler = void 0;
const create_handler_1 = require("../../../utils/create-handler");
exports.getSessionHandler = (0, create_handler_1.createHandler)(async (req, res) => {
    return res.status(200).json(req.session);
});
