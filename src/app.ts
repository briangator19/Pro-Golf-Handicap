import express from 'express';
import cors from 'cors';
import pino from 'pino';
import playersRouter from './routes/players';
import coursesRouter from './routes/courses';
import ingestRouter from './routes/ingest';
const logger = pino();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'incoming request');
  next();
});

app.get('/', (req, res) => res.json({ ok: true, version: '0.1' }));
app.use('/api/players', playersRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/ingest', ingestRouter);

export default app;
