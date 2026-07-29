import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import questionsRoutes from './routes/questions.js';
import papersRoutes from './routes/papers.js';
import examRoutes from './routes/exam.js';
import dashboardRoutes from './routes/dashboard.js';
import interviewRoutes from './routes/interview.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

const seeded = seedDatabase();
console.log(`Question bank ready: ${seeded.questions} questions, ${seeded.interviews} interview questions`);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
