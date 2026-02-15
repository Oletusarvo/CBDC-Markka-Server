import { createBodyParser } from '../../utils/create-body-parser';
import { getRouter } from '../../utils/get-router';
import { checkAuth } from '../auth/middleware/check-auth';
import { createTransaction } from './handlers/create-transaction';
import { transactionSchema } from './schemas/transaction-schema';

const router = getRouter();

router.post('/', checkAuth(), createBodyParser(transactionSchema), createTransaction);

export { router as transactionsRouter };
