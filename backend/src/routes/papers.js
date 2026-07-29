import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const TOPICS = ['Python Basics', 'NumPy', 'Pandas', 'SQL', 'Statistics', 'Data Visualization', 'Logical Aptitude', 'EDA', 'Basic ML', 'Communication'];

// The seed data keeps a reference implementation in code_starter.  Never send
// that implementation to the candidate; expose only a small editable scaffold.
function publicQuestion(question) {
  if (question.type !== 'coding') return question;

  const solutionLines = (question.code_starter || '').split('\n');
  const functionIndex = solutionLines.findIndex(line => line.trimStart().startsWith('def '));
  let codeStarter = '# Write your solution here';

  if (functionIndex >= 0) {
    const imports = solutionLines.slice(0, functionIndex).filter(line => /^\s*(import |from .* import )/.test(line));
    codeStarter = [...imports, solutionLines[functionIndex], '    # Write your solution here'].join('\n');
  } else if (/^\s*(SELECT|WITH|INSERT|UPDATE|DELETE)\b/i.test(question.code_starter || '')) {
    codeStarter = '-- Write your SQL query here';
  }

  return { ...question, code_starter: codeStarter };
}

router.post('/generate', authMiddleware, (req, res) => {
  const db = getDb();
  const userId = req.user.id;
  const duration = req.body.duration || 7200;

  // Get questions user has seen in last 2 attempts
  const recentIds = db.prepare(`
    SELECT DISTINCT pq.question_id FROM papers p
    JOIN paper_questions pq ON p.id = pq.paper_id
    WHERE p.user_id = ?
    ORDER BY p.generated_at DESC
    LIMIT 200
  `).all(userId).map(r => r.question_id);

  const excludeClause = recentIds.length > 0 ? `AND id NOT IN (${recentIds.map(() => '?').join(',')})` : '';
  const excludeParams = recentIds.length > 0 ? recentIds : [];

  function sampleQuestions(type, topic, difficulties, perDifficulty) {
    const results = {};
    for (const diff of difficulties) {
      const count = perDifficulty[diff] || 0;
      if (count <= 0) continue;
      const sql = `SELECT * FROM questions WHERE type = ? AND topic = ? AND difficulty = ? ${excludeClause} ORDER BY RANDOM() LIMIT ?`;
      const params = [type, topic, diff, ...excludeParams, Math.ceil(count * 1.5)];
      let rows = db.prepare(sql).all(...params);
      // If not enough, include recent ones
      if (rows.length < count) {
        const fallback = db.prepare(`SELECT * FROM questions WHERE type = ? AND topic = ? AND difficulty = ? ORDER BY RANDOM() LIMIT ?`).all(type, topic, diff, count);
        rows = [...rows, ...fallback].slice(0, count);
      }
      results[diff] = rows.slice(0, count);
    }
    return Object.values(results).flat();
  }

  const paperId = uuidv4();
  let sortOrder = 0;
  const questions = [];
  const usedIds = new Set();

  function addQuestion(q, section) {
    if (usedIds.has(q.id)) return;
    usedIds.add(q.id);
    questions.push({ paperId, questionId: q.id, section, sortOrder: sortOrder++ });
  }

  // Distribution: 100 MCQ + 30 FIB across 10 topics
  // 40% basic (40+12=52), 40% hard (40+12=52), 20% extreme (20+6=26)
  const mcqPerTopic = 10; // 10 topics * 10 = 100
  const fibPerTopic = 3;  // 10 topics * 3 = 30

  for (const topic of TOPICS) {
    // MCQs: 4 basic, 4 hard, 2 extreme per topic
    const mcqs = sampleQuestions('mcq', topic, ['basic', 'hard', 'extreme'], { basic: 4, hard: 4, extreme: 2 });
    for (const q of mcqs) addQuestion(q, 'mcq');
    const fibs = sampleQuestions('fill_blank', topic, ['basic', 'hard', 'extreme'], { basic: 1, hard: 1, extreme: 1 });
    for (const q of fibs) addQuestion(q, 'fill_blank');
  }

  // Coding questions: 1 medium, 1 hard
  const codingMedium = db.prepare(`SELECT * FROM questions WHERE type = 'coding' AND difficulty = 'medium' ${excludeClause} ORDER BY RANDOM() LIMIT 1`).all(...excludeParams);
  const codingHard = db.prepare(`SELECT * FROM questions WHERE type = 'coding' AND difficulty = 'hard' ${excludeClause} ORDER BY RANDOM() LIMIT 1`).all(...excludeParams);
  const codingQ = [];
  if (codingMedium.length > 0) codingQ.push(codingMedium[0]);
  else codingQ.push(db.prepare("SELECT * FROM questions WHERE type = 'coding' AND difficulty = 'medium' ORDER BY RANDOM() LIMIT 1").get());
  if (codingHard.length > 0) codingQ.push(codingHard[0]);
  else codingQ.push(db.prepare("SELECT * FROM questions WHERE type = 'coding' AND difficulty = 'hard' ORDER BY RANDOM() LIMIT 1").get());

  for (const q of codingQ) addQuestion(q, 'coding');

  // Insert paper and questions
  const insertPaper = db.prepare('INSERT INTO papers (id, user_id, title, duration) VALUES (?, ?, ?, ?)');
  const insertPQ = db.prepare('INSERT INTO paper_questions (paper_id, question_id, section, sort_order) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    insertPaper.run(paperId, userId, `Model Paper ${new Date().toLocaleDateString()}`, duration);
    for (const q of questions) {
      insertPQ.run(q.paperId, q.questionId, q.section, q.sortOrder);
    }
  });
  transaction();

  // Fetch full question details
  const fullQuestions = db.prepare(`
    SELECT q.*, pq.section, pq.sort_order
    FROM paper_questions pq
    JOIN questions q ON pq.question_id = q.id
    WHERE pq.paper_id = ?
    ORDER BY pq.sort_order
  `).all(paperId);

  res.json({ paperId, questions: fullQuestions.map(publicQuestion) });
});

router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const papers = db.prepare(`
    SELECT p.*, 
      (SELECT COUNT(*) FROM paper_questions pq WHERE pq.paper_id = p.id) as question_count,
      (SELECT COUNT(*) FROM attempts a WHERE a.paper_id = p.id AND a.user_id = ?) as attempt_count
    FROM papers p
    WHERE p.user_id = ?
    ORDER BY p.generated_at DESC
  `).all(req.user.id, req.user.id);
  res.json(papers);
});

router.get('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const paper = db.prepare('SELECT * FROM papers WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });
  
  const questions = db.prepare(`
    SELECT q.*, pq.section, pq.sort_order
    FROM paper_questions pq
    JOIN questions q ON pq.question_id = q.id
    WHERE pq.paper_id = ?
    ORDER BY pq.sort_order
  `).all(req.params.id);
  
  res.json({ ...paper, questions: questions.map(publicQuestion) });
});

export default router;
