import { getRouter } from '../../utils/get-router';
import { checkAuth } from '../auth/middleware/check-auth';
import { getCirculation } from './handlers/get-circulation';
import { getUserTokens } from './handlers/get-user-tokens';

const router = getRouter();

router.get('/circulation', getCirculation);
router.get('/tokens', checkAuth(), getUserTokens);
export { router as currenciesRouter };
