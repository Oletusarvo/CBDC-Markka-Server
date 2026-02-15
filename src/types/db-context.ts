import { Knex } from 'knex';

export type DBContext = Knex | Knex.Transaction;
