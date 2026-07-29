import { Router } from 'express';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const userId = req.user.id;

  const totalPapers = db.prepare('SELECT COUNT(*) as count FROM attempts WHERE user_id = ? AND status = ?').get(userId, 'completed');
  const avgScore = db.prepare('SELECT AVG(score) as avg FROM attempts WHERE user_id = ? AND status = ?').get(userId, 'completed');
  const bestScore = db.prepare('SELECT MAX(score) as best FROM attempts WHERE user_id = ? AND status = ?').get(userId, 'completed');

  // Score trend (last 10)
  const trend = db.prepare(`
    SELECT a.score, a.submitted_at, p.title
    FROM attempts a
    JOIN papers p ON a.paper_id = p.id
    WHERE a.user_id = ? AND a.status = ?
    ORDER BY a.submitted_at DESC
    LIMIT 10
  `).all(userId, 'completed');

  // Topic accuracy
  const topicAccuracy = db.prepare(`
    SELECT q.topic,
      SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct,
      COUNT(*) as total
    FROM attempts att
    JOIN answers a ON a.attempt_id = att.id
    JOIN questions q ON a.question_id = q.id
    WHERE att.user_id = ? AND att.status = ?
    GROUP BY q.topic
    ORDER BY q.topic
  `).all(userId, 'completed');

  // Difficulty accuracy
  const difficultyAccuracy = db.prepare(`
    SELECT q.difficulty,
      SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct,
      COUNT(*) as total
    FROM attempts att
    JOIN answers a ON a.attempt_id = att.id
    JOIN questions q ON a.question_id = q.id
    WHERE att.user_id = ? AND att.status = ?
    GROUP BY q.difficulty
  `).all(userId, 'completed');

  // Recent attempts
  const recentAttempts = db.prepare(`
    SELECT a.id, a.score, a.submitted_at, a.time_taken, p.title
    FROM attempts a
    JOIN papers p ON a.paper_id = p.id
    WHERE a.user_id = ? AND a.status = ?
    ORDER BY a.submitted_at DESC
    LIMIT 20
  `).all(userId, 'completed');

  // Weakness alerts
  const weaknesses = [];
  const userAvg = avgScore.avg || 0;
  for (const t of topicAccuracy) {
    const acc = t.total > 0 ? (t.correct / t.total) * 100 : 0;
    if (acc < userAvg - 10 && userAvg > 0) {
      weaknesses.push({ topic: t.topic, accuracy: Math.round(acc), userAvg: Math.round(userAvg) });
    }
  }

  // Current streak
  const streak = db.prepare(`
    WITH daily AS (
      SELECT DISTINCT DATE(submitted_at) as day
      FROM attempts WHERE user_id = ? AND status = ?
      ORDER BY day DESC
    )
    SELECT day FROM daily
  `).all(userId, 'completed');

  let currentStreak = 0;
  if (streak.length > 0) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastDay = new Date(streak[0].day + 'T00:00:00');
    const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      currentStreak = 1;
      for (let i = 1; i < streak.length; i++) {
        const prev = new Date(streak[i-1].day + 'T00:00:00');
        const curr = new Date(streak[i].day + 'T00:00:00');
        const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) currentStreak++;
        else break;
      }
    }
  }

  res.json({
    totalPapers: totalPapers.count,
    avgScore: Math.round(avgScore.avg || 0),
    bestScore: bestScore.best || 0,
    currentStreak,
    trend: trend.reverse(),
    topicAccuracy: topicAccuracy.map(t => ({ topic: t.topic, accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0 })),
    difficultyAccuracy: difficultyAccuracy.map(d => ({ difficulty: d.difficulty, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 })),
    recentAttempts,
    weaknesses
  });
});

export default router;
