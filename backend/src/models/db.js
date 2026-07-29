import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('mcq','fill_blank','coding')),
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('basic','hard','extreme','medium')),
      question_text TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      code_starter TEXT,
      test_cases TEXT
    );

    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      generated_at TEXT DEFAULT (datetime('now')),
      duration INTEGER DEFAULT 7200,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS paper_questions (
      paper_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      section TEXT NOT NULL CHECK(section IN ('mcq','fill_blank','coding')),
      sort_order INTEGER NOT NULL,
      PRIMARY KEY (paper_id, question_id),
      FOREIGN KEY (paper_id) REFERENCES papers(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      paper_id TEXT NOT NULL,
      started_at TEXT DEFAULT (datetime('now')),
      submitted_at TEXT,
      score REAL,
      total_possible REAL,
      time_taken INTEGER,
      status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress','completed','timed_out')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (paper_id) REFERENCES papers(id)
    );

    CREATE TABLE IF NOT EXISTS answers (
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT,
      is_correct INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      PRIMARY KEY (attempt_id, question_id),
      FOREIGN KEY (attempt_id) REFERENCES attempts(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS interview_questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('technical','behavioral','case_study')),
      topic TEXT NOT NULL,
      question_text TEXT NOT NULL,
      model_answer TEXT NOT NULL,
      tips TEXT,
      difficulty TEXT DEFAULT 'medium'
    );

    CREATE TABLE IF NOT EXISTS interview_practice (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer TEXT,
      feedback TEXT,
      practiced_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES interview_questions(id)
    );
  `);
}
