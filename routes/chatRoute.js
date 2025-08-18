import express from 'express';

import { mainHandler } from '../controller/serverController.js';
import {updateChannelHandler} from '../controller/channelController.js'
// import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/prompt', mainHandler);
router.post('/register-channel', updateChannelHandler);

export default router;
