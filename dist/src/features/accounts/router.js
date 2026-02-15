"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsRouter = void 0;
const get_router_1 = require("../../utils/get-router");
const check_auth_1 = require("../auth/middleware/check-auth");
const create_account_1 = require("./handlers/create-account");
const router = (0, get_router_1.getRouter)();
exports.accountsRouter = router;
router.post('/accounts', check_auth_1.checkAuth, create_account_1.createAccount);
