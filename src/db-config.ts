import knex from 'knex';
import config from '../knexfile';
const env = process.env.DB_ENVIRONMENT || 'development';
export const db = knex(config[env]);
