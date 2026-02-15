// Update with your config settings.
require('dotenv').config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5432,
            user: 'dev_user',
            password: process.env.DB_PASSWORD,
            database: 'kryptomarkka_dev',
        },
    },
    production: {
        client: 'pg',
        connection: process.env.DB_CONNECTION,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
        },
    },
};
