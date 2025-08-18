import express from 'express';

// import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/auth', (req, res) => {
  // Accept any request, even if it has Authorization header
  return res.status(200).json({ "success": true, "message": "MCP connected successfully" });
});


export default router;
