import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../models/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

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

  // Question text, rather than ID, is used here because seed data can contain
  // separate records with the same wording.
  const seenQuestionTexts = new Set(db.prepare(`
    SELECT DISTINCT q.question_text
    FROM papers p
    JOIN paper_questions pq ON p.id = pq.paper_id
    JOIN questions q ON q.id = pq.question_id
    WHERE p.user_id = ?
  `).all(userId).map(row => row.question_text));

  const paperId = uuidv4();
  let sortOrder = 0;
  const questions = [];
  function addFreshQuestions(type, difficulty, count, section) {
    const candidates = db.prepare(`
      SELECT * FROM questions
      WHERE type = ? AND difficulty = ?
      ORDER BY RANDOM()
    `).all(type, difficulty);
    const selected = candidates.filter(question => !seenQuestionTexts.has(question.question_text)).slice(0, count);

    if (selected.length < count) {
      throw new Error(`Not enough unused ${difficulty} ${type} questions remain to create a new paper.`);
    }

    for (const question of selected) {
      seenQuestionTexts.add(question.question_text);
      questions.push({ paperId, questionId: question.id, section, sortOrder: sortOrder++ });
    }
  }

  try {
    // 100 MCQ + 30 fill-in-the-blank + 2 coding questions. Selecting from
    // the full bank prevents duplicated wording in a paper when one topic
    // has fewer unique questions than the requested per-topic quota.
    addFreshQuestions('mcq', 'basic', 40, 'mcq');
    addFreshQuestions('mcq', 'hard', 40, 'mcq');
    addFreshQuestions('mcq', 'extreme', 20, 'mcq');
    addFreshQuestions('fill_blank', 'basic', 12, 'fill_blank');
    addFreshQuestions('fill_blank', 'hard', 12, 'fill_blank');
    addFreshQuestions('fill_blank', 'extreme', 6, 'fill_blank');
    addFreshQuestions('coding', 'medium', 1, 'coding');
    addFreshQuestions('coding', 'hard', 1, 'coding');
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }

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
