import express from 'express';
import {
  resetDatabase,
  clearAllData
} from '../controllers/resetController.js';

const router = express.Router();
// Reset routes
router.post('/', resetDatabase);
router.delete('/', clearAllData);

export default router;
