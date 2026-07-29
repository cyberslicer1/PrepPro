import { Router } from 'express';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/topics', authMiddleware, (req, res) => {
  const db = getDb();
  const topics = db.prepare('SELECT DISTINCT topic FROM questions ORDER BY topic').all();
  res.json(topics.map(t => t.topic));
});

router.get('/stats', authMiddleware, (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM questions').get();
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM questions GROUP BY type').all();
  const byTopic = db.prepare('SELECT topic, COUNT(*) as count FROM questions GROUP BY topic ORDER BY topic').all();
  res.json({ total: total.count, byType, byTopic });
});

export default router;
