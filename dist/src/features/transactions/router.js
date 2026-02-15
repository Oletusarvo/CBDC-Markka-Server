"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRouter = void 0;
const get_router_1 = require("../../utils/get-router");
const check_auth_1 = require("../auth/middleware/check-auth");
const create_transaction_1 = require("./handlers/create-transaction");
const router = (0, get_router_1.getRouter)();
exports.transactionsRouter = router;
router.post('/transactions', (0, check_auth_1.checkAuth)(true), create_transaction_1.createTransaction);
