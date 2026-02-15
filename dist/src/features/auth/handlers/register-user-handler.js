"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserHandler = void 0;
const create_handler_1 = require("../../../utils/create-handler");
const db_config_1 = require("../../../db-config");
const password_1 = require("../../../utils/password");
exports.registerUserHandler = (0, create_handler_1.createHandler)(async (req, res) => {
    const credentials = req.data;
    await db_config_1.db.transaction(async (trx) => {
        const [user] = await trx('user')
            .insert({
            email: credentials.email,
            password: await (0, password_1.hashPassword)(credentials.password1),
        })
            .returning('id');
        await trx('account').insert({
            user_id: user.id,
        });
    });
    return res.status(200).end();
}, (err, res) => {
    const msg = err.message.toLowerCase();
    if (msg.includes('duplicate')) {
        if (msg.includes('user_email')) {
            return res.status(409).json({
                error: 'auth:email-taken',
            });
        }
    }
});
