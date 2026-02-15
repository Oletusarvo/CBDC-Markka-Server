import { getRouter } from '../../utils/get-router';
import { getCirculation } from './handlers/get-circulation';

const router = getRouter();

router.get('/circulation', getCirculation);

export { router as currenciesRouter };
