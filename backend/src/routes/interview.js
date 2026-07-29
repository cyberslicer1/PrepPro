import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/questions', authMiddleware, (req, res) => {
  const db = getDb();
  const questions = db.prepare('SELECT * FROM interview_questions ORDER BY RANDOM()').all();
  res.json(questions);
});

router.get('/questions/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const q = db.prepare('SELECT * FROM interview_questions WHERE id = ?').get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Question not found' });
  res.json(q);
});

router.post('/practice', authMiddleware, (req, res) => {
  const { questionId, answer } = req.body;
  const db = getDb();
  const id = uuidv4();
  const q = db.prepare('SELECT * FROM interview_questions WHERE id = ?').get(questionId);
  if (!q) return res.status(404).json({ error: 'Question not found' });

  // Simple feedback generation
  const wordCount = answer ? answer.split(/\s+/).length : 0;
  let feedback = 'Your answer was submitted. ';
  if (wordCount < 10) {
    feedback += 'Consider providing more detail. ';
  } else if (wordCount > 200) {
    feedback += 'Try being more concise. ';
  } else {
    feedback += 'Good length. ';
  }

  // Check for key terms from model answer
  const modelKeywords = q.model_answer.toLowerCase().split(/\s+/).filter(w => w.length > 5);
  const answerLower = (answer || '').toLowerCase();
  const matchedTerms = modelKeywords.filter(k => answerLower.includes(k));
  const matchPct = modelKeywords.length > 0 ? Math.round((matchedTerms.length / modelKeywords.length) * 100) : 0;

  if (matchPct > 60) {
    feedback += 'Your answer covers many key points.';
  } else if (matchPct > 30) {
    feedback += 'You covered some key concepts but could elaborate more.';
  } else {
    feedback += 'Review the model answer for important points you may have missed.';
  }

  db.prepare('INSERT INTO interview_practice (id, user_id, question_id, answer, feedback) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.user.id, questionId, answer || '', feedback);

  res.json({ id, feedback, modelAnswer: q.model_answer, tips: q.tips });
});

router.get('/history', authMiddleware, (req, res) => {
  const db = getDb();
  const history = db.prepare(`
    SELECT ip.*, iq.question_text, iq.topic, iq.type as question_type
    FROM interview_practice ip
    JOIN interview_questions iq ON ip.question_id = iq.id
    WHERE ip.user_id = ?
    ORDER BY ip.practiced_at DESC
  `).all(req.user.id);
  res.json(history);
});

router.get('/stats', authMiddleware, (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM interview_practice WHERE user_id = ?').get(req.user.id);
  const byTopic = db.prepare(`
    SELECT iq.topic, COUNT(*) as count
    FROM interview_practice ip
    JOIN interview_questions iq ON ip.question_id = iq.id
    WHERE ip.user_id = ?
    GROUP BY iq.topic
  `).all(req.user.id);
  res.json({ total: total.count, byTopic });
});

export default router;
