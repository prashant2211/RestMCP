import express from 'express';

import { registrationHandler } from '../controller/mcpRegistration.js';
// import {updateChannelHandler} from '../controller/channelController.js'
// import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/register-mcp', registrationHandler);
//router.post('/register-channel', updateChannelHandler);

export default router;
