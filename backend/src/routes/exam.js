import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/start/:paperId', authMiddleware, (req, res) => {
  const db = getDb();
  const paper = db.prepare('SELECT * FROM papers WHERE id = ? AND user_id = ?').get(req.params.paperId, req.user.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });

  const existingAttempt = db.prepare('SELECT * FROM attempts WHERE paper_id = ? AND user_id = ? AND status = ?').get(req.params.paperId, req.user.id, 'in_progress');
  if (existingAttempt) {
    return res.json(existingAttempt);
  }

  const attemptId = uuidv4();
  db.prepare('INSERT INTO attempts (id, user_id, paper_id, status) VALUES (?, ?, ?, ?)').run(attemptId, req.user.id, req.params.paperId, 'in_progress');
  
  // Initialize empty answers
  const questions = db.prepare('SELECT question_id FROM paper_questions WHERE paper_id = ?').all(req.params.paperId);
  const insertAnswer = db.prepare('INSERT OR IGNORE INTO answers (attempt_id, question_id) VALUES (?, ?)');
  for (const q of questions) {
    insertAnswer.run(attemptId, q.question_id);
  }

  res.json({ id: attemptId, paperId: req.params.paperId, startedAt: new Date().toISOString(), duration: paper.duration });
});

router.post('/save', authMiddleware, (req, res) => {
  const { attemptId, questionId, answer, timeSpent } = req.body;
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(attemptId, req.user.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  // Get correct answer for instant scoring
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);

  let isCorrect = 0;
  if (question && answer !== null && answer !== undefined) {
    if (question.type === 'mcq') {
      isCorrect = answer.trim() === question.correct_answer.trim() ? 1 : 0;
    } else if (question.type === 'fill_blank') {
      const normAns = answer.trim().toLowerCase().replace(/\s+/g, ' ');
      const normCorrect = question.correct_answer.trim().toLowerCase().replace(/\s+/g, ' ');
      isCorrect = normAns === normCorrect ? 1 : 0;
    }
  }

  db.prepare('UPDATE answers SET answer = ?, is_correct = ?, time_spent = COALESCE(time_spent, 0) + ? WHERE attempt_id = ? AND question_id = ?')
    .run(answer || '', isCorrect, timeSpent || 0, attemptId, questionId);

  res.json({ isCorrect, correctAnswer: question ? question.correct_answer : null });
});

router.post('/coding', authMiddleware, (req, res) => {
  const { attemptId, questionId, answer, testCaseResults, timeSpent } = req.body;
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(attemptId, req.user.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  // Calculate coding score from test cases
  const passedCount = testCaseResults ? testCaseResults.filter(r => r.passed).length : 0;
  const totalCount = testCaseResults ? testCaseResults.length : 0;
  const isCorrect = totalCount > 0 && passedCount === totalCount ? 1 : 0;

  db.prepare('UPDATE answers SET answer = ?, is_correct = ?, time_spent = COALESCE(time_spent, 0) + ? WHERE attempt_id = ? AND question_id = ?')
    .run(JSON.stringify({ code: answer, testResults: testCaseResults }), isCorrect, timeSpent || 0, attemptId, questionId);

  res.json({ isCorrect, passedCount, totalCount });
});

router.post('/submit', authMiddleware, (req, res) => {
  const { attemptId } = req.body;
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(attemptId, req.user.id);
  if (!attempt || attempt.status !== 'in_progress') {
    return res.status(400).json({ error: 'Cannot submit this attempt' });
  }

  // Calculate scores
  const paperQuestions = db.prepare(`
    SELECT q.id, q.type, q.topic, q.difficulty
    FROM paper_questions pq
    JOIN questions q ON pq.question_id = q.id
    WHERE pq.paper_id = ?
  `).all(attempt.paper_id);

  const answers = db.prepare('SELECT * FROM answers WHERE attempt_id = ?').all(attemptId);
  const answerMap = {};
  for (const a of answers) {
    answerMap[a.question_id] = a;
  }

  let totalScore = 0;
  let totalPossible = 0;
  const topicScores = {};
  const difficultyScores = {};
  const sectionScores = { mcq: { correct: 0, total: 0 }, fill_blank: { correct: 0, total: 0 }, coding: { correct: 0, total: 0 } };

  for (const q of paperQuestions) {
    const pts = q.type === 'coding' ? 10 : 1;
    totalPossible += pts;
    const ans = answerMap[q.id];
    if (ans && ans.is_correct) {
      totalScore += pts;
    }

    if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
    topicScores[q.topic].total += pts;
    if (ans && ans.is_correct) topicScores[q.topic].correct += pts;

    if (!difficultyScores[q.difficulty]) difficultyScores[q.difficulty] = { correct: 0, total: 0 };
    difficultyScores[q.difficulty].total += pts;
    if (ans && ans.is_correct) difficultyScores[q.difficulty].correct += pts;

    if (sectionScores[q.type]) {
      sectionScores[q.type].total += pts;
      if (ans && ans.is_correct) sectionScores[q.type].correct += pts;
    }
  }

  const scorePct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  // Calculate time taken
  const timeTaken = req.body.timeTaken || 0;

  db.prepare('UPDATE attempts SET status = ?, score = ?, total_possible = ?, submitted_at = datetime(\'now\'), time_taken = ? WHERE id = ?')
    .run('completed', scorePct, totalPossible, timeTaken, attemptId);

  res.json({
    score: scorePct,
    totalScore,
    totalPossible,
    timeTaken,
    sectionScores,
    topicScores: Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      correct: data.correct,
      total: data.total
    })),
    difficultyScores: Object.entries(difficultyScores).map(([diff, data]) => ({
      difficulty: diff,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      correct: data.correct,
      total: data.total
    })),
    sectionScores: Object.entries(sectionScores).map(([section, data]) => ({
      section,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      correct: data.correct,
      total: data.total
    }))
  });
});

router.get('/results/:attemptId', authMiddleware, (req, res) => {
  const db = getDb();
  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(req.params.attemptId, req.user.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(attempt.paper_id);
  const questions = db.prepare(`
    SELECT q.*, a.answer as user_answer, a.is_correct, a.time_spent
    FROM paper_questions pq
    JOIN questions q ON pq.question_id = q.id
    LEFT JOIN answers a ON a.question_id = q.id AND a.attempt_id = ?
    WHERE pq.paper_id = ?
    ORDER BY pq.sort_order
  `).all(req.params.attemptId, attempt.paper_id);

  res.json({ attempt, paper, questions });
});

export default router;
