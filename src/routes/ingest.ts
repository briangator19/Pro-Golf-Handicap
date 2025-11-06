import express from 'express';
import { runTourIngest } from '../services/ingestService';

const router = express.Router();

// Trigger an ingest job (for admin use)
router.post('/run', async (req, res) => {
  const { tour } = req.body;
  if (!tour) return res.status(400).json({ error: 'tour required' });
  try {
    const summary = await runTourIngest(tour);
    res.json({ ok: true, summary });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
